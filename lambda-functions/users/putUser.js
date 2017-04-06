console.log('Loading putUser function...');

/*
    Updates a users data/media files.

    Use aws to communicate with other AWS services,
    asyc for asynchronus tasks,
    user for user token funtions,
    bcryptjs for password hashing,
    cryptojs for token parsing,
    jsonwebtokens for JSON web token creation,
    and GraphicsMagik for image manipulation.
*/

var aws = require("aws-sdk");
var async = require("async");
var user = require("./user.js");
var bcrypt = require('bcryptjs');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var gm = require('gm')
    .subClass({
        imageMagick: true
    });

// Establish a connection to DynamoDB
aws.config.update({
    region: "us-east-1",
});

// Establish connection with DynamoDB
var docClient = new aws.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    async.waterfall([
        function(next) {
            user.authenticate(event.authorizationToken, next);
        }, function(next) {
            verifyDataIntegrity(event, next);
        }, function(data, next) {
            uploadData(event.authorizationToken, data, next);
        }
    ], function(err) {
        if(err) {
            context.fail(JSON.stringify(err));
        } else {
            context.succeed({ status:200 });
        }
    });
};

/**
 * Verify that the data follows the established standards.
 *
 * @param {String} data The unmodified/unchecked data.
 * @param {function} callback The code to execute after verifying integrity.
 */
function verifyDataIntegrity(data, callback) {
    var uploadData = {};

    async.parallel([
        function(next) {
            var response = {
                status: 400
            };

            if(data.name) {
                if(data.name.length > 2 || data.name.length <= 128) {
                    uploadData.name = data.name;
                } else {
                    response.message = "Name length must be between 2 " +
                        "and 128 characters.";
                    next(response);
                }
            }

            if(data.description) {
                if(data.description.length <= 250) {
                    uploadData.description = data.description;
                } else {
                    response.message = "Description length must be no more " +
                        "than 250 characters.";
                    next(response);
                }
            }

            if(data.image) {
                // Check to make sure the passed in string is actually an image
                var matches = data.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length == 3) {
                    uploadData.image = data.image;
                } else {
                    response.message = "Image data must be in base64 " +
                        "string format.";
                    next(response);
                }
            }

            next(null);
        }, function(next) {
            if(data.password) {
                verifyPasswordAuth(data.password, data.authorizationToken,
                        function(err, hashedPassword) {
                    if(hashedPassword) {
                        uploadData.hashedPassword = hashedPassword;
                    }
                    next(err);
                });
            } else {
                next(null);
            }
        }
    ], function(err) {
        if(err) {
            callback(err);
        } else {
            callback(null, uploadData);
        }
    });
}

/**
 * Verify that the the password and token are valid.
 *
 * @param {String} password The unmodified password.
 * @param {String} token  The token to verify.
 * @param {function} callback The code to execute after verifying the password.
 */
function verifyPasswordAuth(password, token, callback) {
    if(password) {
        if(password.length < 6 || password.length > 128) {
            var response = {
                status: 400,
                message: "Password must be between 6 and 128 characters"
            };
            callback(response);
        }

        deleteToken(token, function(err) {
            if(err) {
                callback(err);
            } else {
                hashPassword(password, callback);
            }
        });
    } else {
        callback(null);
    }
}

/**
 * Delete a specified token from DynamoDB.
 *
 * @param {String} token The token to delete.
 * @param {function} callback The code to execute after deleting a token.
 */
function deleteToken(token, callback) {
    // Initialize variables needed later
  var table = "rec_center_tokens";

  if (token) {
      // Find a token in the DB that matches the hashed token
      var tokenHash = cryptojs.MD5(token).toString();
      var params = {
          TableName: table,
          Key: {
              "token_hash": tokenHash
          },
          ReturnValues: "ALL_OLD",
      };

      // Establish connection with DynamoDB
      var docClient = new aws.DynamoDB.DocumentClient();

      // Delete the token
      docClient.delete(params, function(err, data) {
          if (err) {
              var errResponse = {
                  status: 500,
                  message: "Unable to delete token :("
              };
              callback(errResponse);
          } else {
              if (data.Attributes) {
                  callback(null);
              } else {
                  var response = {
                      status: 401,
                      message: "No token found"
                  };
                  callback(response);
              }
          }
      });
  } else {
      var response = {
          status: 400,
          message: "No token provided"
      };
      callback(response);
  }
}

/**
 * Hash the password and return the result.
 *
 * @param {String} password The unmodified password.
 * @param {function} callback The code to execute after hashing a password.
 */
function hashPassword(password, callback) {
    bcrypt.genSalt(10, function(saltErr, salt) {
        if (saltErr) {
            var response = {
                status: 500,
                message: "Unable to generate salt :("
            };
            callback(response);
        } else {
            bcrypt.hash(password, salt, function(hashErr, hashedPassword) {
                if (hashErr) {
                    var response = {
                        status: 500,
                        message: "Unable to hash password :("
                    };
                    callback(response);
                } else {
                    callback(null, hashedPassword);
                }
            });
        }
    });
}

/**
 * Upload the new data on the user.
 *
 * @param {String} token The token to get the user's id from.
 * @param {String} data The data to update with.
 * @param {function} callback The code to execute after uploading the data.
 */
function uploadData(token, data, callback) {
    async.waterfall([
        function(next) {
            user.getIdFromToken(token, next);
        },
        function(id, next) {
            updateUserData(id, data, next);
        }
    ], function(err) {
        callback(err);
    });
}

/**
 * Upload a user's changed data to DynamoDB and S3.
 *
 * @param {String} id The id of the user to update.
 * @param {Object} data The data to upload.
 * @param {function} callback The code to execute after updating a user's data.
 */
function updateUserData(id, data, callback) {
    async.parallel([
        function(next) {
            updateDynamoDb(id, data, next);
        }, function(next) {
            updateS3(data.image, id, data.name, next);
        }
    ], function(err) {
        callback(err);
    });
}

/**
 * Upload a user's changed data to DynamoDB.
 *
 * @param {String} id The id of the user to update.
 * @param {Object} data The data to upload.
 * @param {function} callback The code to execute after uploading to DynamoDB.
 */
function updateDynamoDb(id, data, callback) {
    var updateExpression = "";
    var expressionAttributeNames = {};
    var expressionAttributeValues = {};

    if(data.name) {
        updateExpression += "set #n = :n";
        expressionAttributeNames["#n"] = "name";
        expressionAttributeValues[":n"] = data.name;
    }

    if(data.description) {
        updateExpression += updateExpression.length > 0 ?
            ", #d = :d": "set #d = :d";
        expressionAttributeNames["#d"] = "description";
        expressionAttributeValues[":d"] = data.description;
    }

    if(data.hashedPassword) {
        updateExpression += updateExpression.length > 0 ?
            ", #p = :p": "set #p = :p";
        expressionAttributeNames["#p"] = "password_hash";
        expressionAttributeValues[":p"] = data.hashedPassword;
    }

    var params = {
        TableName: "rec_center_users",
        Key:{
            "id": id
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues:"UPDATED_NEW"
    };

    // Establish a connection with DynamoDB.
    var docClient = new aws.DynamoDB.DocumentClient();

    // Update the relevant info.
    docClient.update(params, function(err, data) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to update the user's info :("
            };
            callback(response);
        } else {
            callback(null);
        }
    });
}

/**
 * Upload a user's changed data to S3.
 *
 * @param {String} image The base64 string of the image.
 * @param {String} id The id of the user in question.
 * @param {String} name The name of the user in question.
 * @param {function} callback The code to execute after uploading to S3.
 */
function updateS3(image, id, name, callback) {
    if(image) {
        if(name === undefined) {
            async.waterfall([
                function(next) {
                    getUserName(id, next);
                }, function(oldName, next) {
                    s3Upload(image, id, oldName, next);
                }
            ], function(err) {
                callback(err);
            });
        } else {
            async.waterfall([
                function(next) {
                    deleteUserFromS3(id, next);
                }, function(next) {
                    s3Upload(image, id, name, callback);
                }
            ], function(err) {
                callback(err);
            });
        }
    } else {
        callback(null);
    }
}

/**
 * Get a user's name from a given id
 *
 * @param {String} id The id of the user in question.
 * @param {function} callback The code to execute getting a user's name.
 */
function getUserName(id, callback) {
    var params = {
        TableName: "rec_center_users",
        AttributesToGet: [ "name" ],
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
                callback(null, data.Item.name);
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

/**
 * Delete a user's data from S3.
 *
 * @param {String} id The id of the user in question.
 * @param {function} callback The code to execute after deleting from S3.
 */
function deleteUserFromS3(id, callback) {
    var bucket = "cbu-rec-center-app";
    var folder = "app/images/users/" + id + "/";

    // Establish the parameters to list all objects in the directory.
    var params = {
        Bucket: bucket,
        Delimiter: '/',
        Prefix: folder,
    };

    // Establish connection to S3
    var s3 = new aws.S3();

    // List all objects in the directory.
    s3.listObjects(params, function(err, data) {
        if(err) {
            callback(err);
        } else {
            s3Objects = [];

            // Add all objects to the list.
            data.Contents.forEach(function(element, index, arr) {
                var thisKey = {
                    Key: element.Key
                };
                s3Objects.push(thisKey);
            });

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
                        message: "Unable to delete old media :("
                    };
                    callback(response);
                } else {
                    callback(null);
                }
            });
        }
    });
}

/**
 * Upload a user's photo to S3 with various amounts of compression.
 *
 * @param {string} b64String The base64 string of the image.
 * @param {string} id The id of the user.
 * @param {string} name The name of the user (optional).
 * @param {function} callback The code to execute after uploading to S3.
 */
function s3Upload(b64String, id, name, callback) {
    // Assign the base64 string of the picture to a buffer
    var imgBuffer = new Buffer(b64String.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    var bucket = "cbu-rec-center-app";
    var key = "app/images/users/" + id + "/uncompressed.jpg";
    var contentType = "image/jpeg";
    var acl = "public-read";
    uploadCount = 0;

    // Upload the uncompressed picture to S3
    uploadImg(bucket, key, contentType,
        imgBuffer, acl,
        function(err) {
            if (err) {
                callback(err);
                return;
            } else {
                // Increment until all 4 operation have executed.
                uploadCount++;
                if (uploadCount == 3) {
                    callback(null);
                }
            }
        });

    // Upload picture compressed to 400px and 100px
    for (var compressedSize = 400; compressedSize > 0; compressedSize -= 300)
            (function(compressedSize) {
        key = "app/images/users/" + id + "/" + compressedSize + "px.jpg";

        // Compress and upload the image
        compressAndUploadImg(imgBuffer, compressedSize,
            contentType, bucket, key, acl,
            function(err) {
                if (err) {
                    callback(err);
                    return;
                } else {
                    // Increment until all 4 operations have executed.
                    uploadCount++;
                    if (uploadCount == 3) {
                        callback(null);
                    }
                }
            });
    })(compressedSize);
}

/**
 * Compress and image and upload it to S3.
 *
 * @param {Buffer} imgBuffer The buffer of the image.
 * @param {Integer} compressedSize Desired compression size.
 * @param {string} contentType The type of content.
 * @param {string} bucket The bucket ot upload to.
 * @param {string} key The key path to upload to.
 * @param {string} acl The permissions associated with the file.
 * @param {function} callback The code to execute after image manipulation.
 */
function compressAndUploadImg(imgBuffer, compressedSize,
    contentType, bucket, key, acl, callback) {
    async.waterfall([
        function compress(next) {
            compressImg(imgBuffer, compressedSize, contentType,
                function(err, newBuffer) {
                    next(err, newBuffer);
                });
        },
        function upload(newBuffer, next) {
            uploadImg(bucket, key, contentType, newBuffer, acl, function(err) {
                next(err);
            });
        }
    ], function(err) {
        callback(err);
    });

}

/**
 * Compress an image from a base64 buffer and return the new buffer.
 *
 * @param {Buffer} imgBuffer The buffer of the image.
 * @param {Integer} compressedSize Desired compression size.
 * @param {string} contentType The type of content.
 * @param {function} callback The code to execute after image compression.
 */
function compressImg(imgBuffer, compressedSize, contentType, callback) {
    // Get image size.
    gm(imgBuffer).size(function(err, size) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to size image : ("
            };
            callback(response);
        } else {
            // Infer the scaling factor to avoid stretching the image unnaturally.
            var scalingFactor = Math.min(
                compressedSize / size.width,
                compressedSize / size.height
            );

            var width = scalingFactor * size.width;
            var height = scalingFactor * size.height;

            // Transform the image buffer in memory.
            gm(imgBuffer).resize(width, height)
                .toBuffer(function(err, buffer) {
                    if (err) {
                        var response = {
                            status: 500,
                            message: "Unable to compress image to " +
                                compressedSize + " px :("
                        };
                        callback(response);
                    } else {
                        callback(null, buffer);
                    }
                });
        }
    });
}

/**
 * Take an image buffer and upload it to S3
 *
 * @param {string} bucket The bucket ot upload to.
 * @param {string} key The key path to upload to.
 * @param {string} contentType The type of content.
 * @param {Buffer} imgBuffer The buffer of the image.
 * @param {string} acl The permissions associated with the file.
 * @param {function} callback The code to execute after uploading an image.
 */
function uploadImg(bucket, key, contentType, imgBuffer, acl, callback) {
    var s3 = new aws.S3({
        params: {
            Bucket: bucket
        }
    });

    // Prepare the parameters for upload
    var params = {
        Key: key,
        ContentEncoding: 'base64',
        ContentType: contentType,
        Body: imgBuffer,
        ACL: acl
    };

    // Upload the image to S3
    s3.upload(params, function(err, data) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to upload image :("
            };
            callback(response);
        } else {
            callback(null);
        }
    });
}
