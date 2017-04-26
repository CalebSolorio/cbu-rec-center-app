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
        var docClient = new aws.DynamoDB.DocumentClient();

        async.waterfall([
            function(next) {
                // Prepare the statement
                var params = {
                    TableName: "rec_center_marks",
                    FilterExpression: "event_id=:id",
                    ExpressionAttributeValues: {
                        ":id": eventId
                    }
                };

                // Update score
                docClient.scan(params, function(err, data) {
                    if (err) {
                        var errResponse = {
                            status: 500,
                            message: "Unable to get query event marks :("
                        };
                        next(errResponse);
                    } else {
                        next(null, data.Count);
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
                        ":s": markNum >= 1 ? 10 * math.log10(markNum + 1) : 0
                    }
                };

                // Connect to DynamoDB
                var docClient = new aws.DynamoDB.DocumentClient();

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
        var docClient = new aws.DynamoDB.DocumentClient();

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
                // STATIC DATE FOR DEMO.
                var currentTime = new Date('2017-04-25').getTime();
                // var currentTime = new Date().getTime();
                var data = [];

                for (var i = 0; i < events.length; i++) {
                    var startTime = Date.parse(events[i].start.dateTime);

                    for (var j = 0; j < scores.length; j++) {
                        if (events[i].id == scores[j].event_id) {
                            var tts = startTime - currentTime;
                            if (tts > 0) {
                                var timeScore = 10 - math.log10(tts);

                                var item = {
                                    score: scores[j].score + timeScore,
                                    event: events[i]
                                };

                                data.push(item);
                            }
                            scores.splice(j, 1);
                            break;
                        }
                    }
                }

                data = quickSort(data, 0, data.length - 1);

                if(start < data.length) {
                    var end = start + 30 < data.length ? start + 30 : data.length;

                    var returnData = {
                        lastEvaluatedKey: end,
                        items: []
                    };

                    for (var index = start; index < end; index++) {
                        returnData.items.push(data[index].event);
                    }

                    wNext(null, returnData);
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

// Scans and returns data on a given DynamoDB table.
function scanData(table, callback) {
    var params = {
        TableName: table
    };

    // Connect to DynamoDB
    var docClient = new aws.DynamoDB.DocumentClient();

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

// Uses the quicksort algorithm to sort events by virality.
// Structure copied from http://www.java2novice.com/java-sorting-algorithms/quick-sort/
function quickSort(data, lowerIndex, higherIndex) {
    var returnData = data;
    var i = lowerIndex;
    var j = higherIndex;

    // calculate pivot number, I am taking pivot as middle index number
    var pivot = returnData[math.floor(lowerIndex + (higherIndex - lowerIndex) / 2)];
    // Divide into two arrays
    while (i <= j) {
        // console.log("high:" + returnData[128]);
        // console.log("high:" + returnData[j]);
        /**
         * In each iteration, we will identify a number from left side which
         * is greater then the pivot value, and also we will identify a number
         * from right side which is less then the pivot value. Once the search
         * is done, then we exchange both numbers.
         */
        while (returnData[i].score > pivot.score) {
            i++;
        }
        while (returnData[j].score < pivot.score) {
            j--;
        }
        if (i <= j) {
            // console.log("exchange " + i + " & " + j);
            returnData = exchangeNumbers(returnData, i, j);
            //move index to next position on both sides
            i++;
            j--;
        }
    }
    // call quickSort() method recursively
    if (lowerIndex < j)
        returnData = quickSort(returnData, lowerIndex, j);
    if (i < higherIndex)
        returnData = quickSort(returnData, i, higherIndex);

    return returnData;
}

// Exchanges two places in an array.
function exchangeNumbers(data, i, j) {
    var returnData = data;
    var temp = returnData[i];
    returnData[i] = returnData[j];
    returnData[j] = temp;

    return returnData;
}
