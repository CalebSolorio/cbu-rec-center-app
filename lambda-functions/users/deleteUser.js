console.log('Loading deleteUser function...');

/*
    Deletes a specified user form the system.

    Use aws to communicate with other AWS services,
    underscore to parse payload data,
    asyc for sequential tasks,
    and crypto-js for token parsing.
*/

var aws = require("aws-sdk");
var jwt = require('jsonwebtoken');
var async = require("async");
var cryptojs = require('crypto-js');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1",
});

exports.handler = function(event, context, callback) {

    async.waterfall([
        function(next) {
            getIdFromToken(event.authorizationToken, next);
        }, function(id, next) {
            deleteUserData(id, next);
        }
    ], function(err, data) {
        if (err) {
            context.fail(JSON.stringify(err));
        } else {
            context.succeed({ status:200 });
        }
    });
};

/**
 * Parse a user's id from a JSON web token.
 *
 * @param {String} token The token to get the user's id from.
 * @return {String} the id parsed from the token.
 */
function getIdFromToken(token, callback) {
    jwt.verify(token, 'YTm=3rC6U6]3Y$eX', function(err, data) {
        if (err) {
            var response = {
                status: 400,
                message: "Token malformed."
            };
            callback(response);
        } else {
            callback(null,
                JSON.parse(JSON.parse(
                cryptojs.AES.decrypt(data, 'rhS@%vQP28!d"HPR')
                .toString(cryptojs.enc.Utf8))).id);
        }
    });
}

/**
 * Hash the password and return the result.
 *
 * @param {String} password The unmodified password.
 */
function deleteUserData(id, callback) {

    async.parallel([
        function(next) {
            deleteFromS3(id, next);
        }, function(next) {
            deleteFromDynamoDb(id, next);
        }
    ], function(err) {
        if(err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function deleteFromS3(id, callback) {
    var bucket = 'cbu-rec-center-app';

    // Establish the parameters to list all objects in the directory.
    var params = {
        Bucket: bucket,
        Delimiter: '/',
        Prefix: "app/images/users/" + id + "/",
    };

    // Establish connection to S3
    var s3 = new aws.S3();

    // List all objects in the directory.
    s3.listObjects(params, function(err, data) {
        if(err) {
            var response = {
                status: 500,
                message: "Unable to locate the user's media files :("
            };
            callback(response);
        } else {
            var s3Objects = [];

            // Add all objects to the list.
            data.Contents.forEach(function(element, index, arr) {
                var thisKey = {
                    Key: element.Key
                };
                s3Objects.push(thisKey);
            });

            // Establish the parameters to delete all objects in the directory.
            params = {
              Bucket: bucket,
              Delete: {
                Objects: s3Objects
              }
            };

            // Delete all objects in the directory.
            s3.deleteObjects(params, function(err, data) {
                if(err) {
                    var response = {
                        status: 500,
                        message: "Unable to delete the user's media files :("
                    };
                    callback(response);
                } else {
                    callback(null);
                }
            });
        }
    });
}

function deleteFromDynamoDb(id, callback) {
    // Choose the table we want to scan and the attributes we want from it.
    var params = {
        TableName: "rec_center_users",
        Key: {
            "id": id,
        },
    };

    // Establish connection with DynamoDB
    var docClient = new aws.DynamoDB.DocumentClient();

    // Get the associated code and compare code hash with the code given.
    docClient.delete(params, function(err, data) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to delete user info :("
            };
            callback(response);
        } else {
            callback(null);
        }
    });
}
