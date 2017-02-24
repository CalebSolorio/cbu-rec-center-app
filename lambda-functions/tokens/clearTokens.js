console.log('Loading ClearTokens function...');

/*
    This removes unused tokens from DynamoDB.

    Use AWS to communicate with DynamoDB,
*/

var AWS = require('aws-sdk');

// Establish a connection to DynamoDB
AWS.config.update({
    region: "us-east-1"
});

// Establish a connection with DynamoDB
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    // Initialize variables needed later
    var table = "rec_center_tokens";

    // Get the time from 14 days ago
    var time = Math.round(new Date().getTime() / 1000) - ((24 * 60 * 60) * 14);

    // Prepare the query
    var params = {
        TableName: table,
        FilterExpression: "last_use < :t",
        ExpressionAttributeValues: {
            ":t": time,
        }
    };

    // Execute the query
    docClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to perform scan. Error JSON:",
                JSON.stringify(err, null, 2));

            var response = {
                status: 500,
                message: "Unable to scan tokens"
            };

            callback(500, response);
        } else {
            if(data.Items.length > 0) {
                var count = 0;
                data.Items.forEach(function(item, index) {
                    // Set to delete tokens more than 30 days old
                    params = {
                        TableName: table,
                        Key: {
                            token_hash: item.token_hash
                        },
                        Limit: 1,
                    };

                    // Delete tokens
                    docClient.delete(params, function(err, delData) {
                        if (err) {
                            console.error("Unable to delete token. Error JSON:",
                                JSON.stringify(err, null, 2));
                            var response = {
                                status: 500,
                                message: "Unable to delete token"
                            };

                            callback(500, response);
                        } else {
                            console.log("Deleted token:",
                                JSON.stringify(delData, null, 2));

                            count++;
                            if(count == data.Items.lenth) {
                                callback(null, { status: 200,
                                        tokensDeleted: data });
                            }
                        }
                    });
                });
            } else {
                var response = {
                    status: 404,
                    message: "No tokens to delete"
                };

                callback(404, response);
            }
        }
    });
};
