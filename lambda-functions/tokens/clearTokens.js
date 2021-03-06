console.log('Loading ClearTokens function...');

/*
    This removes unused tokens from DynamoDB.

    Use aws to communicate with DynamoDB,
*/

var aws = require('aws-sdk');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1"
});

// Establish a connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

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
            var response = {
                status: 500,
                message: "Unable to scan tokens"
            };
            context.fail(JSON.stringify(response));
        } else {
            if(data.Count > 0) {
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
                            var response = {
                                status: 500,
                                message: "Unable to delete token"
                            };
                            context.fail(JSON.stringify(response));
                        } else {
                            count++;
                            if(count == data.Count) {
                                context.succeed({ status: 200,
                                        tokensDeleted: data });
                            }
                        }
                    });
                });
            } else {
                context.succeed({ status: 200 });
            }
        }
    });
};
