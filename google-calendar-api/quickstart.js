var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API.
  authorize(JSON.parse(content), getEvents);
});

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

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Gets the events from both the event and class calendars.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
 function getEvents(auth) {
   var eventCalendarId = 'cburecreationcenter@gmail.com';
   var classCalendarId = 'km5r3grqmjn6b1461i6ipc22as@group.calendar.google.com';
   var date = new Date();

   var count = 0;
   var events = null;
   var classes = null;

   console.log("Getting data from calendar...");

   listEvents(auth, eventCalendarId, date, null, function(err, data) {
     if(err) {
       console.log("Error JSON: ", JSON.stringify(err));
     } else {
       console.log("Events found!");
       events = data;
       count++;
       if(count == 2) {
         organizeAndSaveEvents(events, classes, function(err, finalData) {
           if(err) {
             console.log("Error JSON: ", JSON.stringify(err));
           } else {
             console.log("Logged data to file :)");
           }
         });
       }
     }
   });

   listEvents(auth, classCalendarId, date, null, function(err, data) {
     if(err) {
       console.log("Error JSON: ", JSON.stringify(err));
     } else {
       console.log("Classes found!");
       classes = data;
       count++;
       if(count == 2) {
         organizeAndSaveEvents(events, classes, function(err, finalData) {
           if(err) {
             console.log("Error JSON: ", JSON.stringify(err));
           } else {
             console.log("Logged data to file :)");
           }
         });
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
 function organizeAndSaveEvents(eventData, classData, callback) {
   var data = {
     nextPageToken: {
       events: eventData.nextPageToken,
       classes: classData.nextPageToken,
     },
     days: [],
   };

   var events = eventData.items;
   var classes = classData.items;

   for(var i = 0, eLen = events.length; i < eLen; i++) {
     insertEvent(data, events[i], true);
   }

   for(var j = 0, cLen = classes.length; j < cLen; j++) {
     insertEvent(data, classes[j], false);
   }

   console.log("Writing object to file...");

   writeToFile("schedule.json", data, callback);
 }

/**
 * Insert event into object based on data.
 *
 * @param {Object} object The object to manipulate.
 * @param {Object} event The event to insert.
 * @param {boolean} isEvent Specifies if event or class.
 */
function insertEvent(object, event, isEvent) {
  if(isEvent && event.start.dateTime === undefined) {
    var date = event.start.date;
    for(var i = 0, len1 = object.days.length; i < len1; i++) {
      if(date == object.days[i].date) {
        event.type = "event";
        object.days[i].items.push(event);
        return;
      }
    }

    var summary = event.summary.split("-");
    if(summary.length == 2) {
      var time1 = parseInt(summary[0]);
      time1 += summary[0].slice(-2)
          .toLowerCase() == "pm" ? 12 : 0;
      time1 = (time1 < 10 ? "0" + time1: time1) + ":00";

      var time2 = parseInt(summary[1]);
      time2 += summary[1].slice(-2)
          .toLowerCase() == "pm" ? 12 : 0;
      time2 = (time2 < 10 ? "0" + time2: time2) + ":00";

      object.days.push({
        date: date,
        hours: {
          open: time1,
          close: time2,
        },
        items: []
      });
    }
  } else {
    var dateTime = event.start.dateTime.split("T");
    for(var j = 0, len2 = object.days.length; j < len2; j++) {
      if(dateTime[0] == object.days[j].date) {
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
    timeMax: (new Date(date.getTime() + (30 * 24 * 60 * 60 * 1000))).toISOString(),
    maxResults: 50,
    pageToken: pageToken,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }

    if (response.items.length === 0) {
      console.log('No upcoming events found.');
      return null;
    } else {
      callback(null, response);
    }
  });
}

/**
 * Writes an object to file in JSON format.
 *
 * @param {String} filePath The path of the file we want to write to.
 * @param {Object} object What we want to write to file
 * @param {function} callback What to do after everything is done.
*/
function writeToFile(filePath, object, callback) {
  var jsonObject = JSON.stringify(object);
  fs.writeFile(filePath, jsonObject, 'utf8', callback);
}
