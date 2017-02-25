console.log('Loading verifyCode function...');

/*
    Checks if the given code matches with the hashedCode.

    Use AWS to communicate with other AWS services,
    async for asynchronus actions,
    and bcryptjs for comparing codes.
*/

var aws = require("aws-sdk");
var async = require("async");
var bcrypt = require('bcryptjs');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1",
});

exports.handler = function(event, context, callback) {
    codeMatch(event.email, event.code, function(err, matches) {
        if(err) {
            context.fail(JSON.stringify(err));
        } else {
            context.succeed(matches);
        }
    });
};

/**
 * Check to see if a code for the existing email already exists.
 *
 * @param {String} email The email to find a code with.
 * @param {String} code The code to match with.
 * @returns {boolean} true if the email/code match.
 */
function codeMatch(email, code, callback) {
    // Choose the table we want to scan and the attributes we want from it.
    var params = {
        TableName: "rec_center_codes",
        Key: {
            "email": email,
        },
    };

    // Establish connection with DynamoDB
    var docClient = new aws.DynamoDB.DocumentClient();

    // Get the associated code and compare code hash with the code given.
    docClient.get(params, function(err, data) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to scan for codes :("
            };
            callback(response);
        } else {
            var result = data.Item ?
                bcrypt.compareSync(code, data.Item.code_hash) : false;
            callback(null, result);
        }
    });
}
