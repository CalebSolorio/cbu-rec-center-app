console.log('Loading getMarkedEvents function...');

/*
    This returns all events that a user has marked.

    Use aws to communicate with DynamoDB,
    async for asynchronus operations,
    jwt for JSON web tokens,
    and cryptojs for decrypting authorization tokens.
*/

var aws = require('aws-sdk');
var async = require('async');
var jwt = require('jsonwebtoken');
var cryptojs = require('crypto-js');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1"
});

// Establish connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    async.waterfall([
        function(next) {
            getIdFromToken(event.authorizationToken, next);
        }, function(userId, next) {
            getEvents(userId, next);
        }
    ], function(err, items) {
        if(err) {
            context.fail(JSON.stringify(err));
        } else {
            context.succeed(items);
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
 * Get all events that the specified user has marked.
 *
 * @param {String} userId The ID of the user to query marks from.
 */
function getEvents(userId, callback) {
    var params = {
        TableName : "rec_center_marks",
        KeyConditionExpression: "#u = :u",
        ExpressionAttributeNames:{
            "#u": "user_id"
        },
        ExpressionAttributeValues: {
            ":u": userId
        }
    };

    docClient.query(params, function(err, data) {
        if (err) {
            var errResponse = {
                status: 500,
                message: "Unable to query data :("
            };
            callback(errResponse);
        } else {
            if(data.Items.length > 0) {
                events = [];
                data.Items.forEach(function(element, index, arr) {
                    params = {
                        TableName: "rec_center_events",
                        Key: {
                            "id": element.event_id
                        }
                    };

                    docClient.get(params, function(err, eventData) {
                        if(err) {
                            var response = {
                                status: 500,
                                message: "Unable to get event :("
                            };
                            callback(response);
                        } else {
                            events.push(eventData.Item);
                        }

                        if(index + 1 == data.Items.length) {
                            callback(null, events);
                        }
                    });
                });
            } else {
                var response = {
                    status: 404,
                    message: "No marked data found."
                };
                callback(response);
            }
        }
    });
}
