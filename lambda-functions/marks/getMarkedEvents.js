console.log('Loading getMarkedEvents function...');

/*
    This returns all events that a user has marked.

    Use aws to communicate with DynamoDB,
    async for asynchronus operations,
    user for user token funtions,
    jwt for JSON web tokens,
    and cryptojs for decrypting authorization tokens.
*/

var aws = require('aws-sdk');
var async = require('async');
var user= require('./user.js');
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
            user.authenticate(event.authorizationToken, next);
        }, function(next) {
            user.getIdFromToken(event.authorizationToken, next);
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
 * Get all events that the specified user has marked.
 *
 * @param {String} userId The ID of the user to query marks from.
 * @param {Object} callback The code to execute after getting all events.
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
            if(data.Count > 0) {
                items = [];
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
                            var params = {
                                TableName : "rec_center_marks",
                                ProjectionExpression:"user_id",
                                KeyConditionExpression: "event_id = :id",
                                ExpressionAttributeValues: {
                                    ":id": element.event_id
                                }
                            };

                            docClient.query(params, function(err, markData) {
                                if (err) {
                                    var response = {
                                        status: 500,
                                        message: "Unable to get query marks :("
                                    };
                                    next(response);
                                } else {
                                    var item = {
                                        details: eventData.Item,
                                        marks: markData.Items
                                    };

                                    items.push(item);

                                    if(index + 1 == data.Count) {
                                        callback(null, items);
                                    }
                                }
                            });
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
