console.log('Loading getScheduleByDate function...');

/*
    This removes old events and hours from DynamoDB.

    Use aws to communicate with DynamoDB,
    async for asynchronus operations.
*/

var aws = require('aws-sdk');
var async = require('async');
var user = require('./user.js');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1"
});

// Establish a connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    async.waterfall([
        function(next) {
            user.authenticate(event.authorizationToken, next);
        }, function(next) {
            // ISO string of the given time.
            var date = new Date(Date.parse(event.date))
                .toISOString().substring(0, 10);

            var params = {
                TableName: "rec_center_hours",
                Key: {
                    "date": date,
                },
            };

            // Establish connection with DynamoDB
            var docClient = new aws.DynamoDB.DocumentClient();

            // Get the associated info about the user.
            docClient.get(params, function(err, data) {
                if (err) {
                    var errResponse = {
                        status: 500,
                        message: "Unable to get hours :("
                    };
                    next(errResponse);
                } else {
                    if (data.Item) {
                        var returnData = {
                            date: data.Item.date,
                            hours: data.Item.hours
                        };

                        params = {
                            TableName: "rec_center_events",
                            FilterExpression: "begins_with (#s.#d, :d)",
                            ExpressionAttributeNames: {
                                "#s": "start",
                                "#d": "dateTime",
                            },
                            ExpressionAttributeValues: {
                                ":d": date,
                            },
                        };

                        docClient.scan(params, function(err, events) {
                            if(err) {
                                var response = {
                                    status: 500,
                                    message: "Unable to get scan events :("
                                };
                                next(response);
                            } else {
                                // returnData.items = events.Items;
                                //
                                // next(null, returnData);

                                returnData.items = [];

                                events.Items.forEach(function(element, index, arr) {
                                    var params = {
                                        TableName : "rec_center_marks",
                                        ProjectionExpression:"user_id",
                                        FilterExpression: "event_id = :id",
                                        ExpressionAttributeValues: {
                                            ":id": element.id
                                        }
                                    };

                                    docClient.scan(params, function(err, markData) {
                                        if (err) {
                                            console.log("err", err);
                                            var response = {
                                                status: 500,
                                                message: "Unable to query marks :("
                                            };
                                            next(response);
                                        } else {
                                            var item = {
                                                details: data.Item,
                                                marks: markData.Items
                                            };

                                            returnData.items.push(item);

                                            if(index + 1 == events.Count) {
                                                next(null, returnData);
                                            }
                                        }
                                    });
                                });
                            }
                        });

                    } else {
                        var response = {
                            status: 404,
                            message: "Day not found."
                        };
                        next(response);
                    }
                }
            });
        }
    ], function(err, data) {
        if(err) {
            context.fail(JSON.stringify(err));
        } else {
            context.succeed(data);
        }
    });
};
