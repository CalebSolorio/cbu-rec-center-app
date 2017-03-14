console.log('Loading updateSchedule function...');

/*
    Updates schedule data in DynamoDB.

    Use aws to communicate with other AWS services,
    async for sequential tasks,
    googleapis to acces Google calendars,
    and google-auth-library for authentication.
*/

var aws = require("aws-sdk");
var async = require("async");
var google = require('googleapis');
var googleAuth = require('google-auth-library');

exports.handler = function(event, context, callback) {
    async.waterfall([
        function(next) {
            getClientSecret(next);
        }, function(content, next) {
            authorize(content, next);
        }, function(credentials, next) {
            getEvents(credentials, next);
        }, function(schedule, next) {
            saveEvents(schedule, next);
        }
    ], function(err, response) {
        if (err) {
            context.fail(JSON.stringify(err));
        } else {
            context.succeed(response);
        }
    });
};

/**
 * Gets the client secret from S3.
 *
 * @param {function} callback The callback to call with the secret obtained.
*/
function getClientSecret(callback) {
    var params = {
        Bucket: "cbu-rec-center-app",
        Key: "credentials/client_secret.json"
    };

    var s3 = new aws.S3();

    s3.getObject(params, function(err, data) {
        if (err) {
            callback("Client credentails not found");
        } else {
            callback(null, JSON.parse(data.Body.toString()));
        }
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    var params = {
        Bucket: "cbu-rec-center-app",
        Key: "credentials/client_token.json"
    };

    var s3 = new aws.S3();

    s3.getObject(params, function(err, data) {
        if (err) {
            callback("Client token not found");
        } else {
            token = JSON.parse(data.Body.toString());

            oauth2Client.setCredentials({access_token: token.access_token, refresh_token: token.refresh_token, expiry_date: token.expiry_date});

            callback(null, oauth2Client);
        }
    });
}

/**
 * Gets the events from both the event and class calendars.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {Object} callback The code to execute after getting all events.
 */
function getEvents(auth, callback) {
    var eventCalendarId = 'cburecreationcenter@gmail.com';
    var classCalendarId = 'km5r3grqmjn6b1461i6ipc22as@group.calendar.google.com';
    var date = new Date();

    var count = 0;
    var events = null;
    var classes = null;

    listEvents(auth, eventCalendarId, date, null, function(err, data) {
        if (err) {
            callback(err);
        } else {
            events = data;
            count++;
            if (count == 2) {
                callback(null, organizeEvents(events, classes));
            }
        }
    });

    listEvents(auth, classCalendarId, date, null, function(err, data) {
        if (err) {
            callback(err);
        } else {
            classes = data;
            count++;
            if (count == 2) {
                callback(null, organizeEvents(events, classes));
            }
        }
    });
}

/**
  * Gets the events from both the event and class calendars.
  *
  * @param {Object} events All upcoming Rec Center events.
  * @param {Object} classes All upcoming Rec Center events.
  * @param {function} callback What to do after everything is done.
 */
function organizeEvents(eventData, classData) {
    var data = {
        nextPageToken: {
            events: eventData.nextPageToken,
            classes: classData.nextPageToken
        },
        days: []
    };

    var events = eventData.items;
    var classes = classData.items;

    for (var i = 0, eLen = events.length; i < eLen; i++) {
        insertEvent(data, events[i], true);
    }

    for (var j = 0, cLen = classes.length; j < cLen; j++) {
        insertEvent(data, classes[j], false);
    }

    return data;
}

/**
 * Insert event into object based on data.
 *
 * @param {Object} object The object to manipulate.
 * @param {Object} event The event to insert.
 * @param {boolean} isEvent Specifies if event or class.
 */
function insertEvent(object, event, isEvent) {
    if (isEvent && event.start.dateTime === undefined) {
        var date = event.start.date;
        for (var i = 0, len1 = object.days.length; i < len1; i++) {
            if (date == object.days[i].date) {
                event.type = "event";
                object.days[i].items.push(event);
                return;
            }
        }

        var summary = event.summary.split("-");
        if (summary.length == 2) {
            var time1 = parseInt(summary[0]);
            time1 += summary[0].slice(-2).toLowerCase() == "pm" ? 12 : 0;
            time1 = (time1 < 10 ? "0" + time1 : time1) + ":00";

            var time2 = parseInt(summary[1]);
            time2 += summary[1].slice(-2).toLowerCase() == "pm" ? 12 : 0;
            time2 = (time2 < 10 ? "0" + time2 : time2) + ":00";

            object.days.push({
                date: date,
                hours: {
                    open: time1,
                    close: time2
                },
                items: []
            });
        }
    } else {
        var dateTime = event.start.dateTime.split("T");
        for (var j = 0, len2 = object.days.length; j < len2; j++) {
            if (dateTime[0] == object.days[j].date) {
                event.type = isEvent ? "event" : "class";
                object.days[j].items.push(event);
                return;
            }
        }
    }
}

/**
 * Lists all events of a specified calendar for the next 30 days.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {String} calendarId The id of the calendar to get events from.
 * @param {Date} date The date to start from.
 * @param {String} pageToken The token that refers to the page we want.
 * @param {function} callback What to do after everything is done.
 */
function listEvents(auth, calendarId, date, pageToken, callback) {
    var calendar = google.calendar('v3');

    calendar.events.list({
        auth: auth,
        calendarId: calendarId,
        timeMin: (date).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, events) {
        if (err) {
            response = {
                status: 500,
                message: "Unable to retrieve data from Google's API :("
            };
            callback(response);
        }

        if (events.items.length === 0) {
            response = {
                status: 404,
                message: "No events or classes found."
            };
            callback(response);
        } else {
            callback(null, events);
        }
    });
}

/**
 * Lists all events of a specified calendar for the next 30 days.
 *
 * @param {Object} data The schedule data.
 * @param {function} callback What to do after updating DynamoDB.
 */
function saveEvents(data, callback) {
    // Establish connection with DynamoDB
    var docClient = new aws.DynamoDB.DocumentClient();

    for (var i = 0; i < data.days.length; i++)
        (function(i) {
            var dateParams = {
                TableName: "rec_center_hours",
                Key: {
                    "date": data.days[i].date
                }
            };

            // Get date data and update/create accordingly
            docClient.get(dateParams, function(err, date) {
                if (err) {
                    var response = {
                        status: 500,
                        message: "Unable to get date info :("
                    };
                    callback(err);
                } else {
                    var day = {
                        date: data.days[i].date,
                        hours: data.days[i].hours
                    };

                    var table = "rec_center_hours";

                    if (date.Item) {
                        var updateParams = {
                            TableName: table,
                            Key: {
                                "date": day.date
                            },
                            UpdateExpression: "set #o = :o, " + "#c = :c",
                            ExpressionAttributeNames: {
                                "#o": "hours.open",
                                "#c": "hours.close"
                            },
                            ExpressionAttributeValues: {
                                ":o": day.hours.open,
                                ":c": day.hours.close
                            }
                        };

                        docClient.update(updateParams, function(err) {
                            if (err) {
                                var response = {
                                    status: 500,
                                    message: "Unable to update hours :("
                                };
                                callback(response);
                            }
                        });
                    } else {
                        var createParams = {
                            TableName: table,
                            Item: day
                        };

                        docClient.put(createParams, function(err) {
                            if (err) {
                                var response = {
                                    status: 500,
                                    message: "Unable to insert new date :("
                                };
                                callback(response);
                            }
                        });
                    }
                }
            });

            for (var j = 0; j < data.days[i].items.length; j++)
                (function(j) {
                    var eventParams = {
                        TableName: "rec_center_events",
                        Key: {
                            "id": data.days[i].items[j].id
                        }
                    };

                    // Get event data and update/create accordingly.
                    docClient.get(eventParams, function(err, event) {
                        if (err) {
                            var response = {
                                status: 500,
                                message: "Unable to get event info :("
                            };
                            callback(err);
                        } else {
                            event = data.days[i].items[j];
                            var table = "rec_center_events";

                            if (event.Item) {
                                var updateParams = {
                                    TableName: table,
                                    Key: {
                                        "id": event.id
                                    },
                                    UpdateExpression: "set title = :tt, " + "description =:d , start = :st, " + "end = :e, type = :tp, status = :ss, " + "updated_at = :u",
                                    ConditionExpression: "updated_at < :u",
                                    ExpressionAttributeValues: {
                                        ":tt": event.summary,
                                        ":d": event.description,
                                        ":st": event.start,
                                        ":e": event.end,
                                        ":tp": event.type,
                                        ":ss": event.status,
                                        ":u": new Date.parse(event.updated).getTime() / 1000
                                    }
                                };

                                if (event.attatchments) {
                                    updateParams.updateExpression += "attatchments=:a";
                                    updateParams.ExpressionAttributeValues[":a"] = event.attatchments;
                                }

                                docClient.update(updateParams, function(err) {
                                    if (err) {
                                        var response = {
                                            status: 500,
                                            message: "Unable to update event :("
                                        };
                                        callback(response);
                                    }
                                });
                            } else {
                                var createParams = {
                                    TableName: table,
                                    Item: {
                                        id: event.id,
                                        title: event.summary,
                                        description: event.description,
                                        start: event.start,
                                        end: event.end,
                                        type: event.type,
                                        status: event.status,
                                        updated_at: event.updated
                                    }
                                };

                                if (event.attatchments) {
                                    createParams.Item.attatchments = event.attatchments;
                                }

                                docClient.put(createParams, function(err) {
                                    if (err) {
                                        var response = {
                                            status: 500,
                                            message: "Unable to insert new event :("
                                        };
                                        callback(response);
                                    }
                                });
                            }
                        }
                    });
                })(j);
            }
        )(i);

    var response = {
        status: 200,
        message: "Events updated"
    };
    callback(null, response);
}
