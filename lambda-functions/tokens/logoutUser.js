console.log('Loading logoutOfficer function...');

/*
    This removes a specified token from DynamoDB.

    Use aws to communicate with DynamoDB,
    underscore to parse payload data,
    and cryptojs for comparing tokens.
*/

var aws = require('aws-sdk');
var _ = require('underscore');
var cryptojs = require('crypto-js');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1"
});

// Establish a connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    // Pick out the authentication token from the request body.
    var token = event.authorizationToken;

    // Initialize variables needed later
    var table = "rec_center_tokens";
    var params = {};

    if (token) {
        // Find a token in the DB that matches the hashed token
        var tokenHash = cryptojs.MD5(token).toString();
        params = {
            TableName: table,
            Key: {
                "token_hash": tokenHash
            },
            Limit: 1,
            ReturnValues: "ALL_OLD",
        };

        // Delete the token
        docClient.delete(params, function(err, data) {
            if (err) {
                var response = {
                    status: 500,
                    message: "Unable to delete token :("
                };
                context.fail(JSON.stringify(response));
            } else {
                if (data.Attributes) {
                    context.succeed({ status: 200 });
                } else {
                    var response = {
                        status: 401,
                        message: "No token found"
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
