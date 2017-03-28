/*
    This module is used for user authentication.

    Use aws to communicate with DynamoDB,
    cryptojs for comparing tokens,
    secret for secret codes,
    and jwt for JSON web tokens.
*/

var aws = require("aws-sdk");
var cryptojs = require('crypto-js');
var secret = require('./secret.json');
var jwt = require('jsonwebtoken');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1",
});

module.exports = {
    /**
     * Verify a token's integirty
     *
     * @param {String} token The token to verify user with.
     * @param {String} callback What to do after authentication..
     */
    authenticate: function(token, callback) {
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
            };

            // Execute the query
            docClient.get(params, function(err, data) {
                if (err) {
                    var errResponse = {
                        status: 500,
                        message: "Unable to get the user's profile :("
                    };
                    callback(errResponse);
                } else {
                    if (data.Item !== undefined) {
                        var time = Math.round(new Date().getTime() / 1000);

                        var params = {
                            TableName: "rec_center_tokens",
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
                    } else {
                        var response = {
                            status: 401,
                            message: "Not a valid token. Access Denied."
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
    },

    /**
     * Parse a user's id from a JSON web token.
     *
     * @param {String} token The token to get the user's id from.
     * @param {String} callback What to do after getting id.
     */
    getIdFromToken: function(token, callback) {
        jwt.verify(token, secret.jwt, function(err, data) {
            if (err) {
                var response = {
                    status: 400,
                    message: "Token malformed."
                };
                callback(response);
            } else {
                callback(null,
                    JSON.parse(JSON.parse(
                    cryptojs.AES.decrypt(data, secret.crypto)
                    .toString(cryptojs.enc.Utf8))).id);
            }
        });
    }
};
