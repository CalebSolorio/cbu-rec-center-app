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
    var email = event.email;

    codeExists(email, function(err, doesExist) {
        if(err) {
            context.fail(JSON.stringify(err));
        } else {
            if(doesExist) {
                recreateAndSendCode(email, function(err) {
                    if(err) {
                        context.fail(JSON.stringify(err));
                    } else {
                        var response = {
                            status: 200,
                            message: "Code generated and sent " +
                                "to <" + email + ">",
                        };

                        context.succeed(response);
                    }
                });
            } else {
                var response = {
                    status: 404,
                    message: "Email/code not found. Try creating a code first.",
                };

                context.fail(JSON.stringify(response));
            }
        }
    });

};

/**
 * Check to see if a code for the existing email already exists.
 *
 * @param {String} email The email to find a code with.
 * @return {boolean} True if the email is a CBU email.
 */
function codeExists(email, callback) {
    // Choose the table we want to scan and the attributes we want from it.
    var params = {
        TableName: "rec_center_codes",
        Key: {
            "email": email
        },
    };

    // Establish connection with DynamoDB
    var docClient = new aws.DynamoDB.DocumentClient();

    // See if we can find an existing code associated with this email.
    docClient.get(params, function(err, returnData) {
        if (err) {
            var response = {
              status: 500,
              message: "Unable to scan codes :("
            };
            callback(response);
        } else {
            if(returnData.Item) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        }
    });
}

/**
 * Create a code in DynamoDB
 *
 * @param {String} email The email to identify the code.
 */
function recreateAndSendCode(email, callback) {
    var table = "rec_center_codes";

    async.waterfall([
        function generateCode(next) {
            var code = [];

            for(var i = 0; i < 6; i++) {
                code.push(Math.floor(Math.random() * 10));
            }

            code = code.join('');

            bcrypt.genSalt(10, function(saltErr, salt) {
                if(saltErr) {
                    var response = {
                        status: 500,
                        message: "Unable to generate salt :(",
                    };
                    next(response);
                } else {
                    bcrypt.hash(code, salt, function(hashErr, hashedCode) {
                        if (hashErr) {
                            var response = {
                                status: 500,
                                message: "Unable to hash code :(",
                            };
                            next(response);
                        } else {
                            next(null, code, hashedCode);
                        }
                    });
                }
            });
        },
        function updateCode(originalCode, hashedCode, next) {
            var time = Math.round(new Date().getTime() / 1000);

            // Set the parameters we need to pass to the statement.
            var params = {
                TableName: table,
                Key: {
                    "email": email
                },
                UpdateExpression: "set code_hash=:h, updated_at = :t",
                ExpressionAttributeValues: {
                    ":h": hashedCode,
                    ":t": time,
                }
            };

            docClient.update(params, function(err, data) {
                if (err) {
                    var response = {
                        status: 500,
                        message: "Unable to update code :(",
                    };
                    next(response);
                } else {
                    next(null, originalCode);
                }
            });
        },
        function sendEmail(code, next) {
            // Set the parameters for the app to be sent.
            var params = {
                Destination: {
                   ToAddresses: [email]
                },
                Message: {
                   Body: {
                       Html: {
                           Data:"<h4>Welcome to the CBU Rec Center App!</h4>" +
                               "<p>All that you need to do is enter the following " +
                               "code into your app:</p><h2>" + code +
                               "</h2><p>Now you're all set!</p></br>" +
                               "<p>Stay swol,</br>-The CBU Dev Team</p></br>" +
                               "<p><b>Didn't sign up for our awesome app?</b> " +
                               "No worries! Just ignore this email and it'll all be good :)"
                       },
                       Text: {
                           Data: "Welcome to the CBU Rec Center App! Just enter " +
                                "the code '" + code + "' into the app and you'll " +
                                "be all set. Didn't sign up for our awesome app? " +
                                "No worries! Just ignore this email and it'll all " +
                                "be good :) Stay swol - The CBU Dev Team"
                       }
                   },
                   Subject: {
                       Data: "Your Verification Code!"
                   }
                },
                Source: "CBU Rec Center App <cbureccenterapp@gmail.com>"
            };

            // Load AWS SES
            var ses = new aws.SES({apiVersion: '2010-12-01'});

            ses.sendEmail(params, function(err, data) {
                if(err) {
                    var response = {
                        status: 500,
                        message: "Unable to send email :(",
                    };
                    next(response);
                } else {
                    next(null);
                }
             });
        }
    ], function(err) {
        callback(err);
    });
}
