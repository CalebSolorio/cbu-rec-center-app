console.log('Loading clearSchedule function...');

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
    async.parallel([
        function removeHours(next) {
            var table = "rec_center_hours";

            // Prepare the query
            var params = {
                TableName: table,
            };

            // Execute the query
            docClient.scan(params, function(err, data) {
                if (err) {
                    var response = {
                        status: 500,
                        message: "Unable to scan for hours :("
                    };
                    callback(response);
                } else {
                    // Get the time from 24 hours ago
                    var time = Math.floor(new Date().getTime() /
                        (1000 * 60 * 60 * 24));
                    var count = 0;

                    data.Items.forEach(function(item, index) {
                        if (Math.floor(Date.parse(item.date) /
                                (1000 * 60 * 60 * 24)) < time) {
                            // Set to delete tokens more than 30 days old
                            params = {
                                TableName: table,
                                Key: {
                                    date: item.date
                                },
                                Limit: 1,
                            };

                            // Delete tokens
                            docClient.delete(params, function(err, delData) {
                                if (err) {
                                    var response = {
                                        status: 500,
                                        message: "Unable to delete hours :("
                                    };
                                    callback(response);
                                } else {
                                    count++;
                                    if(count == data.Count) {
                                        next(null);
                                    }
                                }
                            });
                        } else {
                            count++;
                            if(count == data.Count) {
                                next(null);
                            }
                        }
                    });
                }
            });
        }, function removeEvents(next) {
            var table = "rec_center_events";

            // Prepare the query
            var params = {
                TableName: table,
            };

            // Execute the query
            docClient.scan(params, function(err, data) {
                if (err) {
                    var response = {
                        status: 500,
                        message: "Unable to scan events :("
                    };
                    callback(response);
                } else {
                    // Get the current time for comparison
                    var time = new Date().getTime();
                    var count = 0;

                    data.Items.forEach(function(item, index) {
                        if (Date.parse(item.date) < time) {
                            // Set to delete tokens more than 30 days old
                            params = {
                                TableName: table,
                                Key: {
                                    date: item.id
                                },
                                Limit: 1,
                            };

                            // Delete tokens
                            docClient.delete(params, function(err, delData) {
                                if (err) {
                                    var response = {
                                        status: 500,
                                        message: "Unable to delete event :("
                                    };
                                    callback(response);
                                } else {
                                    count++;
                                    if(count == data.Count) {
                                        next(null);
                                    }
                                }
                            });
                        } else {
                            count++;
                            if(count == data.Count) {
                                next(null);
                            }
                        }
                    });
                }
            });
        }
    ], function(err) {
        if(err) {
            context.fail(err);
        } else {
            var response = {
                status: 200,
                message: "Successfully cleared old events/hours."
            };
            context.succeed(response);
        }
    })
};
