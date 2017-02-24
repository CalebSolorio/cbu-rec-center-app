console.log('Loading postCode function...');

/*
    Validates the given email then creates and
    sends a code to the email address for verification.

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

    if(validateEmail(email)){
        codeExists(email, function(err, doesExist) {
            if(err) {
                callback(err);
            } else {
                if(!doesExist) {
                    createAndSendCode(email, function(err) {
                        if(err) {
                            callback(err);
                        } else {
                            var response = {
                                status: 200,
                                message: "Code generated and sent " +
                                    "to <" + email + ">",
                            };

                            callback(null, response);
                        }
                    });
                } else {
                    var response = {
                        status: 403,
                        message: "Code already exists. Try resending it.",
                    };

                    callback(403, response);
                }
            }
        });
    } else {
        var response = {
            status: 400,
            message: "Email must be a valid 'calbaptist.edu' address",
        };

        callback(response);
    }

};

/**
 * Verify that the given email is a calbaptist.edu email address.
 *
 * @param {String} email The email to validate.
 * @return {boolean} True if the email is a CBU email.
 */
function validateEmail(email) {
    var regex = /^\w+([\.-]?\w+)*@calbaptist.edu$/;
    return regex.test(email);
}

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

    // See if we can find an existing code associated with this email.
    docClient.get(params, function(err, returnData) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:",
                JSON.stringify(err));
            callback(err);
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
function createAndSendCode(email, callback) {
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
                    console.log("Error generating salt. Error JSON: " +
                        JSON.stringify(saltErr));
                    next(saltErr);
                } else {
                    bcrypt.hash(code, salt, function(hashErr, hashedCode) {
                        if (hashErr) {
                            console.log("Error hashing code. Error JSON: " +
                                JSON.stringify(err));
                            next(hashErr);
                        } else {
                            console.log("Hashed code:", hashedCode);
                            next(null, code, hashedCode);
                        }
                    });
                }
            });
        },
        function insertCode(originalCode, hashedCode, next) {
            // Set the parameters we need to pass to the statement.
            var params = {
                TableName: table,
                Item: {
                    email: email,
                    code_hash: hashedCode,
                    created_at: Math.round(new Date().getTime() / 1000),
                    updated_at: Math.round(new Date().getTime() / 1000)
                }
            };

            // Execute the statement.
            docClient.put(params, function(err) {
                if (err) {
                    console.log("Error inserting code into database, JSON:",
                        JSON.stringify(err));
                    next(err);
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
                    console.log("Error sending email, JSON:",
                        JSON.stringify(err));
                    next(err);
                } else {
                    next(null);
                }
             });
        }, function removeOldCodes() {
            // Get the time from 24 hours ago.
            var time = Math.round(new Date().getTime() / 1000) - (24 * 60 * 60);

            // Prepare the query
            var params = {
                TableName: table,
                FilterExpression: "updated_at < :t",
                ExpressionAttributeValues: {
                    ":t": time,
                },
                Limit: 1
            };

            // Execute the query
            docClient.scan(params, function(err, data) {
                if (err) {
                    console.error("Unable to perform query. Error JSON:",
                        JSON.stringify(err, null, 2));
                    context.fail(err);
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
                                Limit: 1,
                            };

                            // Delete tokens
                            docClient.delete(params, function(err, delData) {
                                if (err) {
                                    console.error("Unable to delete code. Error JSON:",
                                        JSON.stringify(err, null, 2));
                                    context.fail(err);
                                } else {
                                    console.log("Deleted code:",
                                        JSON.stringify(delData, null, 2));

                                    count++;
                                    if(count == data.Items.lenth) {
                                        callback(null);
                                    }
                                }
                            });
                        });
                    } else {
                        callback(null);
                    }
                }
            });
        }
    ], function(err) {
        callback(err);
    });
}
