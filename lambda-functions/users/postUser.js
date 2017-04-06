console.log('Loading postUser function...');

/*
    Inserts a new user into the database and uploads their
    media files to S3.

    Use aws to communicate with other AWS services,
    underscore to parse payload data,
    asyc for asynchronus tasks
    bcryptjs for password hashing,
    uuid for generating unique identifiers,
    and GraphicsMagik for image manipulation.
*/

var aws = require("aws-sdk");
var _ = require('underscore');
var async = require("async");
var bcrypt = require('bcryptjs');
var uuid = require('node-uuid');
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
    // Parse the details that we care about
    var data = _.pick(event, "email", "password", "name", "description");
    data.email = data.email.toLowerCase();

    if (data.email && data.password && event.code) {
        if (data.password.length >= 6 && data.password.length <= 128 &&
            data.name.length >= 2 && data.name.length <= 128 &&
            data.description.length <= 250) {
            // Verify that the code matches the hased code in DynamoDB, then upload.
            codeMatch(data.email, event.code, function(err, matches) {
                if (err) {
                    context.fail(JSON.stringify(err));
                } else {
                    if (matches) {
                        uploadData(event.image, data, function(err) {
                          if(err) {
                              context.fail(JSON.stringify(err));
                          } else {
                              var response = {
                                  status: 200,
                                  message: "Profile created for " + data.name + "!"
                              };
                              context.succeed(response);
                          }
                        });
                    } else {
                        response = {
                            status: 401,
                            message: "Unauthorized user. Please include a valid " +
                                "verification code and try again."
                        };

                        context.fail(JSON.stringify(response));
                    }
                }
            });
        } else {
            response = {
                status: 403,
                message: "Password length must be between 6 and 128 " +
                    "charactersin. Name length must be between 2 and 128" +
                    "characters. Description length must be no more than " +
                    "250 characters."
            };

            context.fail(JSON.stringify(response));
        }

    } else {
        response = {
            status: 400,
            message: "Email and password, and verification code must be provided"
        };

        context.fail(JSON.stringify(response));
    }
};

/**
 * Check to see if a code for the existing email already exists.
 *
 * @param {String} email The email to find a code with.
 * @param {String} code The code to match with.
 * @param {function} callback The code to execute after getting matching.
 */
function codeMatch(email, code, callback) {
    // Choose the table we want to scan and the attributes we want from it.
    var params = {
        TableName: "rec_center_codes",
        Key: {
            "email": email,
        },
    };

    // Get the associated code and compare code hash with the code given.
    docClient.get(params, function(err, data) {
        if (err) {
            var response = {
                status: 500,
                message: "Unable to scan verification codes :("
            };
            callback(response);
        } else {
            callback(null, data.Item && code ?
                bcrypt.compareSync(code, data.Item.code_hash) : false);
        }
    });
}

/**
 * Check to see if a code for the existing email already exists.
 *
 * @param {String} userImage The base64 encoded string of the user's picture.
 * @param {String} userData The text data to store in DynamoDB.
 * @param {function} callback The code to execute after uploading a user's data.
 */
function uploadData(userImage, userData, callback) {
    async.waterfall([
        function prepare(next) {
            var uploadData = userData;

            // Create a unique identifier
            uploadData.id = uuid.v1();

            hashPassword(uploadData.password, function(err, hashedPassword) {
                if (err) {
                    next(err);
                } else {
                    uploadData.password_hash = hashedPassword;
                    delete uploadData.password;
                    next(null, uploadData);
                }
            });

        },
        function upload(uploadData, next) {
            var uploadCount = 0;

            dynamoDbUpload(uploadData, function(err) {
                if (err) {
                    next(err);
                } else {
                    uploadCount++;
                    if (uploadCount == 2) {
                        next(null);
                    }
                }
            });

            if (userImage) {
                s3Upload(userImage, uploadData.id, uploadData.name, function(err) {
                    if (err) {
                        next(err);
                    } else {
                        uploadCount++;
                        if (uploadCount == 2) {
                            next(null);
                        }
                    }
                });
            } else {
                uploadCount++;
            }

        }, function deleteCode(next) {
            // Specify the code to be deleted.
            var params = {
                TableName: "rec_center_codes",
                Key: {
                    "email": userData.email,
                },
            };

            // Delete the code from DynamoDB.
            docClient.delete(params, function(err, data) {
                if (err) {
                    var response = {
                        status: 500,
                        message: "Unable to delete code : ("
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

/**
 * Hash the password and return the result.
 *
 * @param {String} password The unmodified password.
 * @param {function} callback The code to execute after hasing a password.
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
 * Insert a new row of data into DynamoDB.
 *
 * @param {Object} item The information the insert into the table.
 * @param {function} callback The code to execute after uploading to DynamoDB.
 */
function dynamoDbUpload(item, callback) {
    var table = "rec_center_users";

    // Prepare to scan.
    var params = {
        TableName: table,
        FilterExpression: "email = :e",
        ExpressionAttributeValues: {
            ":e": item.email,
        },
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            var errResponse = {
                status: 500,
                message: "Unable to scan users :("
            };
            callback(errResponse);
        } else {
            if (data.Items.length > 0) {
                var response = {
                    status: 403,
                    message: "This user already exists."
                };
                callback(response);
            } else {
                params = {
                    TableName: table,
                    Item: item
                };

                // Insert the user's data.
                docClient.put(params, function(err) {
                    if (err) {
                        var response = {
                            status: 500,
                            message: "Unable to insert new user :("
                        };
                        callback(response);
                    } else {
                        callback(null);
                    }
                });
            }
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
    // Check to make sure the passed in string is actually an image
    var matches = b64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        response = {
            status: 403,
            message: "Image data must be is base64 format."
        };
        callback(response);
    } else {
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
 * @param {function} callback The code to execute after compressing and uploading.
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
 * @param {function} callback The code to execute after compression.
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
