console.log('Loading resendCode function...');

/*
    Recreates an existing code and sends it to the specified email.

    Use AWS to communicate with other AWS services,
    asyc for asynchronus tasks,
    and bcryptjs for code hashing,
*/

var aws = require("aws-sdk");
var async = require("async");
var bcrypt = require('bcryptjs');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1",
});

// Establish connection with DynamoDB.
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    var table = "rec_center_codes";

    // Get the time from 24 hours ago.
    var time = Math.round(new Date().getTime() / 1000) - (24 * 60 * 60);

    // Prepare the query
    var params = {
        TableName: table,
        FilterExpression: "updated_at < :t",
        ExpressionAttributeValues: {
            ":t": time,
        },
    };

    // Execute the query
    docClient.scan(params, function(err, data) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to scan for old codes :(",
            };
            context.fail(JSON.stringify(response));
        } else {
            if(data.Items.length > 0) {
                var count = 0;
                data.Items.forEach(function(item, index) {
                    // Set to delete tokens more than 30 days old
                    params = {
                        TableName: table,
                        Key: {
                            email: item.email
                        },
                    };

                    // Delete tokens
                    docClient.delete(params, function(err, delData) {
                        if (err) {
                            var response = {
                                status: 500,
                                message: "Unable to delete tokens :(",
                            };
                            context.fail(JSON.stringify(response));
                        } else {
                            count++;
                            if(count == data.Items.lenth) {
                                context.succeed();
                            }
                        }
                    });
                });
            } else {
                context.succeed();
            }
        }
    });
};
