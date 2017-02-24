console.log('Loading authenticateUser function...');

/*
    This is an authenticator that will run before
    any manipulation of DynamoDB or S3 takes place.

    Use AWS to communicate with DynamoDB,
    cryptojs for comparing tokens.
*/

var AWS = require("aws-sdk");
var cryptojs = require('crypto-js');

// Establish a connection to DynamoDB
AWS.config.update({
    region: "us-east-1",
});

exports.handler = function(event, context, callback) {
    // Pick out the authentication token from the request body.
    var token = event.authorizationToken;

    // Find a hashed token that matches the clients.
    if (token !== undefined) {
        var docClient = new AWS.DynamoDB.DocumentClient();
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
                console.error("Unable to read item. Error JSON:",
                    JSON.stringify(err, null, 2));
                var response = {
                    status: 500,
                    message: "Unable to get user's profile"
                };

                context.fail(response);
            } else {
                console.log("Queried successfully:",
                    JSON.stringify(data, null, 2));
                if (data.Item !== undefined) {
                    var principalId = "user";
                    var effect = "Allow";
                    var resource = "arn:aws:execute-api:us-east-1:372695149422:7um0hkzst5/*";
                    var policy = generatePolicy(principalId, effect, resource);

                    updateToken(docClient, table, hashedToken, function(err) {
                        if(err) {
                            context.fail(err);
                        } else {
                            context.succeed(policy);
                        }
                    })
                } else {
                    var response = {
                        status: 401,
                        message: "Not a valid token. Access Denied."
                    };

                    context.fail(response);
                }
            }
        });
    } else {
        console.log("Token undefined");
        context.fail("No token given.");
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
 * Updates a token's last_use attribute to the current time
 *
 * @param {string} docClient The DynamoDB client.
 * @param {string} table The name of the table to alter data in.
 * @param {string} hashedToken The token to look for.
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
            console.error("Unable to update item. Error JSON:", JSON.stringify(err));
            var response = {
                status: 500,
                message: "Unable to update token"
            };

            callback(response);
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data));
            callback(null);
        }
    });
}
