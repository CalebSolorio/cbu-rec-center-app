console.log('Loading markEvent function...');

/*
    This marks an event for a user in DynamoDB.

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
    if(event.authorizationToken && event.eventId) {
        var eventId = event.eventId;
        var userId;

        async.waterfall([
            function(next) {
                user.authenticate(event.authorizationToken, next);
            }, function(next) {
                user.getIdFromToken(event.authorizationToken, next);
            }, function(id, next) {
                userId = id;
                verifyUser(userId, next);
            }, function(next) {
                verifyEvent(eventId, next);
            }, function(next) {
                verifyUniqueMark(userId, eventId, next);
            }, function(next) {
                mark(userId, eventId, next);
            }
        ], function(err) {
            if(err) {
                context.fail(JSON.stringify(err));
            } else {
                context.succeed({ status: 200 });
            }
        });
    } else {
        var response = {
            status: 400,
            message: "Authorization token and event id must be provided."
        };
        context.fail(JSON.stringify(response));
    }
};

/**
 * Verify that the user exists in the database.
 *
 * @param {String} userId The ID of the user in DynamoDB.
 * @param {Object} callback The code to execute after verifying user.
 */
function verifyUser(userId, callback) {
    var params = {
        TableName: "rec_center_users",
        Key:{
            "id": userId
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            var response = {
                status: 404,
                message: "User not found."
            };
            callback(response);
        } else {
            callback(null);
        }
    });
}

/**
 * Verify that the event exists in the database.
 *
 * @param {String} eventId The ID of the event in DynamoDB.
 * @param {Object} callback The code to execute after verifying event.
 */
function verifyEvent(eventId, callback) {
    var params = {
        TableName: "rec_center_events",
        Key:{
            "id": eventId
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to verify event's existence :("
            };
            callback(response);
        } else {
            if(data.Item) {
                callback(null);
            } else {
                var response = {
                    status: 404,
                    message: "Event not found."
                };
                callback(response);
            }
        }
    });
}

/**
 * Verify that the mark will be unique in the database.
 *
 * @param {String} userId The ID of the user in DynamoDB.
 * @param {String} eventId The ID of the event in DynamoDB.
 * @param {Object} callback The code to execute after getting all events.
 */
function verifyUniqueMark(userId, eventId, callback) {
    var params = {
        TableName: "rec_center_marks",
        Key:{
            "user_id": userId,
            "event_id": eventId
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            var errResponse = {
                status: 500,
                message: "Unable to verify unique mark :("
            };
            callback(errResponse);
        } else {
            if(data.Item) {
                var response = {
                    status: 403,
                    message: "User has already marked this event"
                };
                callback(response);
            } else {
                callback(null);
            }

        }
    });
}

/**
 * Create a mark entity in DynamoDB.
 *
 * @param {String} userId The ID of the user in DynamoDB.
 * @param {String} eventId The ID of the event in DynamoDB.
 * @param {Object} callback The code to execute after marking an event.
 */
function mark(userId, eventId, callback) {
    var params = {
        TableName:"rec_center_marks",
        Item:{
            "user_id": userId,
            "event_id": eventId
        }
    };

    docClient.put(params, function(err) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to mark event :("
            };
            callback(response);
        } else {
            callback(null);
        }
    });
}
