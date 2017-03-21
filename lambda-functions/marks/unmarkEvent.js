console.log('Loading unmarkEvent function...');

/*
    This removes old events and hours from DynamoDB.

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
var virality = require('./virality.js');


// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1"
});

// Establish a connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    if(event.authorizationToken && event.eventId) {
        async.waterfall([
            function(next) {
                user.authenticate(event.authorizationToken, next);
            }, function(next) {
                user.getIdFromToken(event.authorizationToken, next);
            }, function(userId, next) {
                unmark(userId, event.eventId, next);
            }, function(next) {
                virality.update(event.eventId, next);
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
 * Verify that the mark exists in the database.
 *
 * @param {String} userId The ID of the user in DynamoDB.
 * @param {String} eventId The ID of the event in DynamoDB.
 * @param {Object} callback The code to execute after verification.
 */
function verifyMarkExists(userId, eventId, callback) {
    var params = {
        TableName: "rec_center_marks",
        Key:{
            "userId": userId,
            "eventId": eventId
        }
    };

    docClient.get(params, function(err, data) {
        if (err) {
            var response = {
                status: 404,
                message: "Cannot find mark for this event and user"
            };
            callback(response);
        } else {
            callback(null);
        }
    });
}

/**
 * Remove a mark entity from DynamoDB.
 *
 * @param {String} userId The ID of the user in DynamoDB.
 * @param {String} eventId The ID of the event in DynamoDB.
 * @param {Object} callback The code to execute after unmarking an event.
 */
function unmark(userId, eventId, callback) {
    var params = {
        TableName: "rec_center_marks",
        Key:{
            "user_id": userId,
            "event_id": eventId
        },
        ReturnValues: "ALL_OLD"
    };

    docClient.delete(params, function(err, data) {
        if (err) {
            var errResponse = {
                status: 500,
                message: "Unable to unmark an event :("
            };
            callback(errResponse);
        } else {
            if(data.Attributes) {
                callback(null);
            } else {
                var response = {
                    status: 404,
                    message: "No event found."
                };
                callback(response);
            }
        }
    });
}
