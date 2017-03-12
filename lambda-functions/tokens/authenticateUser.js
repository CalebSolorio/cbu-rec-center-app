console.log('Loading authenticateUser function...');

/*
    This is an authenticator that will run before any
    manipulation of an established user's data takes place.

    Use aws to communicate with DynamoDB,
    cryptojs for comparing tokens,
    and secret for secret codes.
*/

var aws = require("aws-sdk");
var cryptojs = require('crypto-js');
var secret = require('./secret.json');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1",
});

exports.handler = function(event, context, callback) {
    // Pick out the authentication token from the request body.
    var token = event.authorizationToken;

    // Find a hashed token that matches the clients.
    if (token !== undefined) {
        var docClient = new aws.DynamoDB.DocumentClient();
        var table = "rec_center_tokens";
        var hashedToken = cryptojs.MD5(token).toString();

        // Prepare the query
        var params = {
            TableName: table,
            Key: {
                token_hash: hashedToken
            },
            Limit: 1
        };

        // Execute the query
        docClient.get(params, function(err, data) {
            if (err) {
                var errRresponse = {
                    status: 500,
                    message: "Unable to get the user's profile :("
                };
                context.fail(JSON.stringify(errResponse));
            } else {
                if (data.Item !== undefined) {
                    var principalId = "User";
                    var effect = "Allow";
                    var resource = "arn:aws:execute-api:us-east-1:372695149422:7um0hkzst5/*";
                    var policy = generatePolicy(principalId, effect, resource);

                    updateToken(docClient, table, hashedToken, function(err) {
                        if(err) {
                            context.fail(JSON.stringify(err));
                        } else {
                            context.succeed(policy);
                        }
                    });
                } else {
                    var response = {
                        status: 401,
                        message: "Not a valid token. Access Denied."
                    };
                    context.fail(JSON.stringify(response));
                }
            }
        });
    } else {
        var response = {
            status: 400,
            message: "No token provided"
        };
        context.fail(JSON.stringify(response));
    }
};

/**
 * Generates a policy for the end user.
 *
 * @param {string} principalId Specifies who the policy is for.
 * @param {string} effect The desired effect of the policy.
 * @param {string} resource The ARN associated with the policy.
 * @return the generated policy.
 */
function generatePolicy(principalId, effect, resource) {
    console.log("Generating policy");
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
}

/**
 * Updates a token's last_use attribute to the current time.
 *
 * @param {string} docClient The DynamoDB client.
 * @param {string} table The name of the table to alter data in.
 * @param {string} hashedToken The token to look for.
 * @param {Object} callback The code to execute after updating a token.
 */
function updateToken(docClient, table, hashedToken, callback) {
    var time = Math.round(new Date().getTime() / 1000);

    var params = {
        TableName:table,
        Key:{
            "token_hash": hashedToken
        },
        UpdateExpression: "set last_use = :t",
        ExpressionAttributeValues:{
            ":t": time
        },
        ReturnValues:"UPDATED_NEW"
    };

    docClient.update(params, function(err, data) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to update token :("
            };
            callback(response);
        } else {
            callback(null);
        }
    });
}
