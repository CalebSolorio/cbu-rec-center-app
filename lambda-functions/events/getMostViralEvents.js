console.log('Loading getMostViral function...');

/*
    This gets the most viral events currently.

    Use aws to communicate with DynamoDB,
    async for asynchronus operations,
    user for user token funtions,
    jwt for JSON web tokens,
    and cryptojs for decrypting authorization tokens.
*/

var aws = require('aws-sdk');
var async = require('async');
var user= require('./user.js');
var jwt = require('jsonwebtoken');
var cryptojs = require('crypto-js');
var virality = require('./virality.js');

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1"
});

// Establish connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    if(event.authorizationToken) {
        async.waterfall([
            function(next) {
                user.authenticate(event.authorizationToken, next);
            }, function(next) {
                virality.getMostViral(event.start ? event.start : 0, next);
            }
        ], function(err) {
            if(err) {
                context.fail(JSON.stringify(err));
            } else {
                context.succeed({ status: 200 });
            }
        });
    } else {
        var response = {
            status: 400,
            message: "Authorization token must be provided."
        };
        context.fail(JSON.stringify(response));
    }
};
