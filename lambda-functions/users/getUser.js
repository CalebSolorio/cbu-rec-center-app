console.log('Loading putUser function...');

/*
    Gets the public-facing info on a user.

    Use aws to communicate with other AWS services
    and asyc for asynchronus tasks,
    user for user token funtions.
*/

var aws = require("aws-sdk");
var async = require("async");
var user = require("./user.js");

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1",
});

exports.handler = function(event, context, callback) {
  async.waterfall([
    function(next) {
      user.authenticate(event.authorizationToken, next);
    }, function(next) {
      if(event.id) {
        getUserInfo(event.id, next);
      } else {
        user.getIdFromToken(event.authorizationToken, function(err, id) {
          if(err) {
            next(err);
          } else {
            getUserInfo(id, next);
          }
        })
      }
    }
  ], function(err, response) {
    if(err) {
      context.fail(JSON.stringify(err));
    } else {
      context.succeed(response);
    }
  });


};

/**
 * Gets a user's data from DynamoDB.
 *
 * @param {String} token The user's token.
 * @param {function} callback The code to execute after getting a user's info.
 */
function getUserInfo(id, callback) {
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
          "id": id,
      },
  };

  // Establish connection with DynamoDB
  var docClient = new aws.DynamoDB.DocumentClient();

  // Get the associated info about the user.
  docClient.get(params, function(err, data) {
      if (err) {
          var errResponse = {
              status: 500,
              message: "Unable to get user info :("
          };
          callback(errResponse);
      } else {
          if (data.Item) {
              callback(null, data.Item);
          } else {
              var response = {
                  status: 404,
                  message: "User not found."
              };
              callback(response);
          }
      }
  });
}
