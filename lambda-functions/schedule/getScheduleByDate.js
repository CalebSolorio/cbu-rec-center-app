console.log('Loading getScheduleByDate function...');

/*
    This removes old events and hours from DynamoDB.

    Use aws to communicate with DynamoDB,
    async for asynchronus operations.
*/

var aws = require('aws-sdk');
var async = require('async');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1"
});

// Establish a connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
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
            var response = {
                status: 500,
                message: "Unable to get hours :("
            };
            context.fail(JSON.stringify(response));
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
                            message: "Unable to get events :("
                        };
                        context.fail(JSON.stringify(response));
                    } else {
                        returnData.items = events.Items;
                        context.succeed(returnData);
                    }
                });

            } else {
                var response = {
                    status: 404,
                    message: "Day not found."
                };
                context.fail(JSON.stringify(response));
            }
        }
    });

};
