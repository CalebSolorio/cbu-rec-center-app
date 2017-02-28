console.log('Loading putUser function...');

/*
    Gets the public-facing info on a user.

    Use aws to communicate with other AWS services
    and asyc for asynchronus tasks.
*/

var aws = require("aws-sdk");
var async = require("async");

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1",
});

exports.handler = function(event, context, callback) {
    // Choose the table we want to get user info from
    // and the attributes we want about the user.
    var params = {
        TableName: "rec_center_users",
        AttributesToGet: [
            "id",
            "name",
            "description",
        ],
        Key: {
            "id": event.id,
        },
    };

    // Establish connection with DynamoDB
    var docClient = new aws.DynamoDB.DocumentClient();

    // Get the associated info about the user.
    docClient.get(params, function(err, data) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to get user info :("
            };
            context.fail(JSON.stringify(response));
        } else {
            if (data.Item) {
                context.succeed(data.Item);
            } else {
                var response = {
                    status: 404,
                    message: "User not found."
                };
                context.fail(JSON.stringify(response));
            }
        }
    });
};
