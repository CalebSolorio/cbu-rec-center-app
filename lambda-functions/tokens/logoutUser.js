console.log('Loading logoutOfficer function...');

/*
    This removes a specified token from DynamoDB.

    Use aws to communicate with DynamoDB,
    underscore to parse payload data,
    cryptojs for comparing tokens,
    and user for user token funtions.
*/

var aws = require('aws-sdk');
var async = require("async");
var cryptojs = require('crypto-js');
var user = require('./user.js');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1"
});

// Establish a connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    // Pick out the authentication token from the request body.
    var token = event.authorizationToken;

    async.waterfall([
        function(next) {
            user.authenticate(token, next);
        }, function(next) {
            deleteToken(token, next);
        }
    ], function(err) {
        if(err) {
            context.fail(JSON.stringify(err));
        } else {
            context.succeed({ status: 200 });
        }
    });
};


/**
 * @param {String} token The given token.
 * @param {function} callback The code to execute after deleting a token.
 */
function deleteToken(token, callback) {
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
            ReturnValues: "ALL_OLD",
        };

        // Delete the token
        docClient.delete(params, function(err, data) {
            if (err) {
                var errResponse = {
                    status: 500,
                    message: "Unable to delete token :("
                };
                callback(errResponse);
            } else {
                if (data.Attributes) {
                    callback(null);
                } else {
                    var response = {
                        status: 401,
                        message: "No token found"
                    };
                    callback(response);
                }
            }
        });
    } else {
        var response = {
            status: 400,
            message: "No token provided"
        };
        callback(response);
    }
}
