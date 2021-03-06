console.log('Loading deleteUser function...');

/*
    Deletes a specified user form the system.

    Use aws to communicate with other AWS services,
    underscore to parse payload data,
    asyc for sequential tasks,
    user for user token funtions,
    and crypto-js for token parsing.
*/

var aws = require("aws-sdk");
var jwt = require('jsonwebtoken');
var async = require("async");
var user = require("./user.js");
var cryptojs = require('crypto-js');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1",
});

exports.handler = function(event, context, callback) {

    async.waterfall([
        function(next) {
            user.authenticate(event.authorizationToken, next);
        }, function(next) {
            user.getIdFromToken(event.authorizationToken, next);
        }, function(id, next) {
            deleteUserData(id, next);
        }
    ], function(err, data) {
        if (err) {
            context.fail(JSON.stringify(err));
        } else {
            context.succeed({ status:200 });
        }
    });
};

/**
 * Removes a user's data.
 *
 * @param {String} id The user's id.
 * @param {function} callback The code to execute after deleting a user's data.
 */
function deleteUserData(id, callback) {

    async.parallel([
        function(next) {
            deleteFromS3(id, next);
        }, function(next) {
            deleteFromDynamoDb(id, next);
        }
    ], function(err) {
        if(err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

/**
 * Removes a user's file from S3.
 *
 * @param {String} id The user's id.
 * @param {function} callback The code to execute after deleting from S3.
 */
function deleteFromS3(id, callback) {
    var bucket = 'cbu-rec-center-app';

    // Establish the parameters to list all objects in the directory.
    var params = {
        Bucket: bucket,
        Delimiter: '/',
        Prefix: "app/images/users/" + id + "/",
    };

    // Establish connection to S3
    var s3 = new aws.S3();

    // List all objects in the directory.
    s3.listObjects(params, function(err, data) {
        if(err) {
          var response = {
              status: 500,
              message: "Unable to locate user's media files :("
          };
          callback(response);
        } else {
            var s3Objects = [];

            // Add all objects to the list.
            data.Contents.forEach(function(element, index, arr) {
                var thisKey = {
                    Key: element.Key
                };
                s3Objects.push(thisKey);
            });

            if(s3Objects.length > 0) {
                // Establish the parameters to delete all objects in the directory.
                params = {
                  Bucket: bucket,
                  Delete: {
                    Objects: s3Objects
                  }
                };

                // Delete all objects in the directory.
                s3.deleteObjects(params, function(err, data) {
                    if(err) {
                        var response = {
                            status: 500,
                            message: "Unable to delete the user's media files :("
                        };
                        callback(response);
                    } else {
                        callback(null);
                    }
                });
            } else {
                // No files to delete.
                callback(null);
            }
        }
    });
}

/**
 * Removes a user's data from DynamoDB.
 *
 * @param {String} id The user's id.
 * @param {function} callback The code to execute after deleting from DynamoDB.
 */
function deleteFromDynamoDb(id, callback) {
    // Choose the table we want to scan and the attributes we want from it.
    var params = {
        TableName: "rec_center_users",
        Key: {
            "id": id,
        },
    };

    // Establish connection with DynamoDB
    var docClient = new aws.DynamoDB.DocumentClient();

    // Get the associated code and compare code hash with the code given.
    docClient.delete(params, function(err, data) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to delete user info :("
            };
            callback(response);
        } else {
            callback(null);
        }
    });
}
