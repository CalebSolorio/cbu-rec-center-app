console.log('Loading clearEvents function...');

/*
    This removes old events and hours from DynamoDB.

    Use aws to communicate with DynamoDB,
    async for asynchronus operations,
    firebase-admin for sending messages through FCM,
    and serviceAcount for accessing FCM.
*/

var aws = require('aws-sdk');
var async = require('async');
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1"
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cbu-rec-center-app.firebaseio.com"
});

// Establish a connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    async.parallel([
        function updateHours(next) {
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
                    var time = Math.floor(new Date(new Date().getTime() -
                      (8 * 60 * 60 * 1000)).getTime() /
                      (1000 * 60 * 60 * 24));
                    var count = 0;

                    data.Items.forEach(function(item, index) {
                        // Delete the hours of days past.
                        if (Math.floor(Date.parse(item.date) /
                                (1000 * 60 * 60 * 24)) < time) {
                            params = {
                                TableName: table,
                                Key: {
                                    date: item.date
                                },
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
        }, function updateEvents(next) {
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
                        // Delete events already passed.
                        if (Date.parse(item.date) <= time) {
                            async.parallel([
                                function(next) {
                                    var eventParams = {
                                        TableName: table,
                                        Key: {
                                            id: item.id
                                        },
                                    };
                                    docClient.delete(eventParams, next);
                                }, function(next) {
                                    var markParams = {
                                        TableName: "rec_center_marks",
                                        Key: {
                                            event_id: item.id
                                        },
                                    };
                                    docClient.delete(markParams, next);
                                }, function(next) {
                                    var viralityParams = {
                                        TableName: "rec_center_virality",
                                        Key: {
                                            event_id: item.id
                                        },
                                    };
                                    docClient.delete(viralityParams, next);
                                }
                            ], function(err) {
                                if (err) {
                                    var response = {
                                        status: 500,
                                        message: "Unable to delete event data :("
                                    };
                                    callback(response);
                                } else {
                                    count++;
                                    if(count == data.Count) {
                                        next(null);
                                    }
                                }
                            });
                         // Send FCM notification to events starting in 15 minutes or less.
                        } else if(Date.parse(item.date) <= (time + (1000 * 60 * 15))) {
                          var topic = "cbu-rec-center-event-" + item.id;
                          var payload = {
                            "notification" : {
                              "body" : item.title + " starts soon!",
                              "title" : "Don't forget!"
                            },
                          };

                          // Send a message to the devices corresponding to the provided
                          // registration tokens.
                          admin.messaging().sendToTopic(topic, payload)
                            .then(function(response) {
                              // See the MessagingDevicesResponse reference documentation for
                              // the contents of response.
                              console.log("Successfully sent message to " + topic + ":", JSON.stringify(response));

                              count++;
                              if(count == data.Count) {
                                  next(null);
                              }
                            })
                            .catch(function(error) {
                              console.log("Error sending message:", error);

                              var response = {
                                  status: 500,
                                  message: "Unable to delete send notification :("
                              };
                              callback(response);
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
    });
};
