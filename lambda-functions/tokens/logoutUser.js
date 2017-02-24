console.log('Loading logoutOfficer function...');

/*
    This removes a specified token from DynamoDB.

    Use AWS to communicate with DynamoDB,
    underscore to parse payload data,
    and cryptojs for comparing tokens.
*/

var AWS = require('aws-sdk');
var _ = require('underscore');
var cryptojs = require('crypto-js');

// Establish a connection to DynamoDB
AWS.config.update({
    region: "us-east-1"
});

// Establish a connection with DynamoDB
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    // Pick out the authentication token from the request body.
    var token = event.cbuRecCenterAuth;

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
                console.error("Unable to delete token. Error JSON:",
                    JSON.stringify(err, null, 2));
                var response = {
                    status: 500,
                    message: "Unable to delete token :("
                };

                callback(500, response);
            } else {
                console.log("Deleted token:", JSON.stringify(data, null, 2));
                if (data.Attributes) {
                    callback(null, { status: 200 });
                } else {
                    var response = {
                        status: 401,
                        message: "No token found"
                    };

                    callback(401, response);
                }
            }
        });
    } else {
        var response = {
            status: 400,
            message: "No token provided"
        };

        callback(400, response);
    }
};
