/*
    This module is used for calculating and getting events' virality.

    Use aws to communicate with DynamoDB,
    cryptojs for comparing tokens,
    secret for secret codes,
    and jwt for JSON web tokens.
*/

var aws = require("aws-sdk");
var async = require("async");
var math = require("mathjs");

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1"
});

module.exports = {
    /**
     * Updates an event's virality score.
     *
     * @param {String} eventId The id of the event to calculate virality for.
     * @param {String} callback What to do after calculating virality.
     */
    update: function(eventId, callback) {
        // Connect to DynamoDB
        var docClient = new AWS.DynamoDB.DocumentClient();

        async.waterfall([
            function(next) {
                // Prepare the statement
                var params = {
                    TableName: "rec_center_virality",
                    KeyConditionExpression: "event_id=:id",
                    ExpressionAttributeValues: {
                        ":id": eventId
                    }
                };

                // Update score
                docClient.scan(params, function(err, data) {
                    if (err) {
                        var errResponse = {
                            status: 500,
                            message: "Unable to get the user's profile :("
                        };
                        next(errResponse);
                    } else {
                        next(data.Count);
                    }
                });
            }, function(markNum, next) {
                // Prepare the statement
                var params = {
                    TableName: "rec_center_virality",
                    Key: {
                        "event_id": eventId
                    },
                    UpdateExpression: "set score=:s",
                    ExpressionAttributeValues: {
                        ":s": markNum >= 1 ? 10 * math.log10(markNum + 1) : 1
                    }
                };

                // Connect to DynamoDB
                var docClient = new AWS.DynamoDB.DocumentClient();

                // Update score
                docClient.update(params, function(err, data) {
                    if (err) {
                        var errResponse = {
                            status: 500,
                            message: "Unable to get the user's profile :("
                        };
                        next(errResponse);
                    } else {
                        next(null);
                    }
                });
            }
        ], function(err) {
            callback(err);
        });
    },

    /**
     * Get the most viral events.
     *
     * @param {String} start The index to start collecting onwards from.
     * @param {String} callback What to do after getting events.
     */
    getMostViral: function(start, callback) {
        // Connect to DynamoDB
        var docClient = new AWS.DynamoDB.DocumentClient();

        async.waterfall([
            function(wNext) {
                var scores = [];
                var events = [];

                async.parallel([
                    function(pNext) {
                        scanData("rec_center_events", function(err, data) {
                            if (err) {
                                wNext(err);
                            } else {
                                events = data;
                                pNext(null);
                            }
                        });
                    },
                    function(pNext) {
                        scanData("rec_center_virality", function(err, data) {
                            if (err) {
                                wNext(err);
                            } else {
                                scores = data;
                                pNext(null);
                            }
                        });
                    }
                ], function(err) {
                    wNext(err, events, scores);
                });
            },
            function(events, scores, wNext) {
                var currentTime = new Date().getTime();
                var data = [];

                for (var i = 0; i < events.length; i++) {
                    var startTime = Date.parse(event[i].start.dateTime).getTime();
                    for (var j = 0; j < scores.length; j++) {
                        if (events[i].id == scores[j].event_id) {
                            var tts = startTime - currentTime - (5 * 60 * 1000);
                            if (tts > 0) {
                                var timeScore = 10 - math.log(math.abs(tts));

                                var item = {
                                    score: scores[j].score + timeScore,
                                    event: events[i]
                                };

                                data.push(item);
                            }
                            delete scores[j];
                            break;
                        }
                    }
                }

                quickSort(data, 0, data.length - 1, wNext);

                if(start < data.length) {
                    var end = start + 30 < data.length ? start + 30 : data.length;

                    var returnData = {
                        lastEvaluatedKey: end,
                        items: {}
                    };

                    for (var index = start; index < end; index++) {
                        returnData.items.push(data[i].event);
                    }

                    callback(null, returnData);
                } else {
                    var response = {
                        status: 404,
                        message: "No more events found."
                    };
                    callback(response);
                }
            }
        ], function(err, returnData) {
            callback(err, returnData);
        });

    }
};

function scanData(table, callback) {
    var params = {
        TableName: table
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            var errResponse = {
                status: 500,
                message: "Unable to get the user's profile :("
            };
            callback(errResponse);
        } else {
            callback(null, data.Items);
        }
    });
}

// Structure copied from http://www.java2novice.com/java-sorting-algorithms/quick-sort/
function quickSort(data, lowerIndex, higherIndex) {
    var i = lowerIndex;
    var j = higherIndex;

    // calculate pivot number, I am taking pivot as middle index number
    var pivot = data[lowerIndex + (higherIndex - lowerIndex) / 2];
    // Divide into two arrays
    while (i <= j) {
        /**
         * In each iteration, we will identify a number from left side which
         * is greater then the pivot value, and also we will identify a number
         * from right side which is less then the pivot value. Once the search
         * is done, then we exchange both numbers.
         */
        while (data[i].score < pivot.score) {
            i++;
        }
        while (data[j].score > pivot.score) {
            j--;
        }
        if (i <= j) {
            exchangeNumbers(i, j);
            //move index to next position on both sides
            i++;
            j--;
        }
    }
    // call quickSort() method recursively
    if (lowerIndex < j)
        quickSort(data, lowerIndex, j);
    if (i < higherIndex)
        quickSort(data, i, higherIndex);
}

function exchangeNumbers(data, i, j) {
    var temp = data[i];
    data[i] = data[j];
    data[j] = temp;
}
