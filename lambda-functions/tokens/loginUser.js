console.log('Loading loginUser function...');

/*
    This will verify the email/password combo,
    then create and return a new token.

    Use aws to communicate with DynamoDB,
    underscore to parse payload data,
    bcrypt for data encryption,
    cryptojs for comparing tokens,
    and jsonwebtokens for JSON Web Token creation
    (who would've thunk it),
    and secret for secret codes.
*/

var aws = require('aws-sdk');
var _ = require('underscore');
var async = require('async');
var bcrypt = require('bcryptjs');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var secret = require('./secret.json');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1",
});

// Establish a connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(req, context, callback) {
    // Pick out the email and password from the request body.
    var body = _.pick(req, 'email', 'password');

    // First authenticate the user. Then, create a token if appropriate.
    // Insert the token into the DB and send it back to the client.
    async.waterfall([
        function(next) {
            authenticate(body, next);
        },
        function(user, next) {
            checkTokenBucket(user, next);
        },
        function(user, next) {
            insertToken(user, function(err, response) {
              next(err, response);
            });
        }
    ], function(err, response) {
        if(err) {
            context.fail(JSON.stringify(err));
        } else {
            context.succeed(response);
        }
    });
};

/**
 * Compare request data to the email and hashed password in the DB.
 *
 * @param {Object} body The request data given by the client.
 * @return the user associated with the given email and password.
 * @param {Object} callback The code to execute after authentication.
 */
function authenticate(body, callback) {
    if (typeof body.email !== 'string' ||
        typeof body.password !== 'string') {
        response = {
            status: 400,
            message: "Both the email and password given must be of type string."
        };
        callback(response);
    }

    var table = "rec_center_users";
    var email = body.email.toLowerCase();

    // Prepare the scan
    var params = {
        TableName: table,
        FilterExpression: "email = :e",
        ExpressionAttributeValues: {
            ":e": email,
        },
    };

    // Execute the query
    docClient.scan(params, function(err, data) {
        if (err) {
            var errResponse = {
                status: 500,
                message: "Unable to query scan :("
            };
            callback(errResponse);

        } else {
            // See if the queried user's password hash matches.
            if (data.Items.length > 0 &&
                    data.Items !== undefined &&
                    bcrypt.compareSync(body.password, data.Items[0].password_hash)) {
                callback(null, data.Items[0]);
            } else {
                var response = {
                    status: 404,
                    message: "No users match that email/password combination."
                };
                callback(response);
            }
        }
    });
}

/**
 * Verify that the user is authorized to generate a token.
 *
 * @param {Object} user The user whose tokens to check for.
 * @param {Object} callback The code to execute after checking token bucket.
 */
function checkTokenBucket(user, callback) {
    // Prepare the scan
    var params = {
        TableName: "rec_center_tokens",
        FilterExpression: "#u = :u",
        ExpressionAttributeNames: {
            "#u": "user_id",
        },
        ExpressionAttributeValues: {
            ":u": user.id,
        }
    };

    // Execute the scan
    docClient.scan(params, function(err, data) {
        if (err) {
            var errResponse = {
                status: 500,
                message: "Unable to scan tokens :("
            };
            callback(errResponse);

        } else {
            if (data.Count < 300) {
                var time = Math.round((new Date().getTime() / 1000) - 3);
                for (var i; i < data.Count; i++) {
                    var token = data.Items[i];
                    if (token.last_use >= time) {
                        var response = {
                            status: 401,
                            message: "Unauthorized to generate more than 1 token " +
                                "every 3 seconds"
                        };

                        callback(response);
                        return;
                    }
                }

                callback(null, user);
            } else {
                var fullResponse = {
                    status: 401,
                    message: "Unauthorized to generate more than 100 active tokens"
                };
                callback(fullResponse);
            }
        }
    });
}

/**
 * Generate and intert a new token into DynamoDB.
 *
 * @param {Object} user The user whose data to generate a token off of.
 * @param {Object} callback The code to execute after inserting a token.
 */
function insertToken(user, callback) {
    var table = "rec_center_tokens";
    var token = generateToken(user, 'authentication');
    if (token) {
        var hash = cryptojs.MD5(token).toString();
        var time = Math.round(new Date().getTime() / 1000);

        // Prepare to insert a new token
        var params = {
            TableName: table,
            Item: {
                "token_hash": hash,
                "user_id": user.id,
                "created_at": time,
                "last_use": time,
            }
        };

        // Insert a new token.
        docClient.put(params, function(err, tokenData) {
            if (err) {
                var response = {
                    status: 500,
                    message: "Unable to insert token :("
                };
                callback(response);
            } else {
                callback(null, {
                    status: 200,
                    id: user.id,
                    authorizationToken: token
                });
            }
        });
    } else {
        var response = {
            status: 500,
            message: "Error generating token :("
        };
        callback(response);
    }
}

/**
 * Create a token using the clients encrypted and signed info.
 *
 * @param {Object} body The user whose data to generated the token off of.
 * @param {Object} callback The code to execute after generating a token.
 */
function generateToken(user, type) {
    if (!_.isString(type)) {
        return undefined;
    }

    try {
        var stringData = JSON.stringify({
            id: user.id,
            type: type
        });

        var encryptedData = cryptojs.AES.encrypt(JSON.stringify(stringData),secret.crypto).toString();
        var token = jwt.sign(encryptedData, secret.jwt);

        return token;
    } catch (e) {
        return undefined;
    }
}
