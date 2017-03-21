# CBU REC Center App

#### API Endpoint: https://1fgs4l61r4.execute-api.us-east-1.amazonaws.com/Sprint2

## API Resources
- ##### [/code](#code):
   - ###### [/send](#code-send) : Send verification code.
   - ###### [/resend](#code-resend) : Resend verification code.
   - ###### [/verify](#code-verify) : Verify verification code.
- ##### [/events](#events):
    - ###### [/date](#events-date): Get events by date.
    - ###### [/viral](#events-viral): Get events by virality.
- ##### [/login](#login) : Log users in and out.
- ##### [/marks](#marks) : Mark/unmark events and get events marked.
- ##### [/user](#user) : Create/read/update/delete user info.

# <a id="code"></a>/code
This endpoint deals with all functionality centered around verification codes. To prove they are a part of the CBU community, users will be required to provide their personal 'calbaptist.edu' email address. A 6-digit verification code will be sent to this address and must be provided at the time of registration.
## <a id="code-send"></a>/send : POST
Calling this resource will send a verification code to the specified email address, provided it's a valid 'calbaptist.edu' email address.</br>
**URL Query Strings:** None</br>
**Headers:** None
**Body:**</br>
```
{
  "email": "CaptainJack.Sparrow@calbaptist.edu"
}
```
**Successful Response Example:**
```
{
  "status": 200,
  "message": "Code generated and sent to <CaptainJack.Sparrow@calbaptist.edu>"
}
```
**Unsuccessful Response Example:**
```
{
  "status": 400,
  "message": "Email must be a valid 'calbaptist.edu' address"
}
```
## <a id="code-resend"></a>/resend : POST
Calling this resource will resend a verification code to the specified email address, provided it's a valid 'calbaptist.edu' email address and a code has already been sent once before.</br>
**URL Query Strings:** None</br>
**Headers:** None</br>
**Body:**</br>
```
{
  "email": "CaptainJack.Sparrow@calbaptist.edu"
}
```
**Successful Response Example:**
```
{
  "status": 200,
  "message": "Code generated and sent to <CaptainJack.Sparrow@calbaptist.edu>"
}
```
**Unsuccessful Response Example:**
```
{
  "status": 404,
  "message": "Email/code not found. Try creating a code first."
}
```

## <a id="code-verify"></a>/verify : POST
Calling this resource will check if the given email matches the given verification code, returning either true or false; however, it will not remove the code from the database. This makes it possible to check a verification code's validity before allowing to user to fill out their personal details.</br>
**URL Query Strings:** None</br>
**Headers:** None</br>
**Body:**</br>
```
{
  "email": "CaptainJack.Sparrow@calbaptist.edu"
  "code": "24601"
}
```
**Successful Response Example:**
```
{
  "matches": false
}
```
**Unsuccessful Response Example:**
```
{
  "status": 500,
  "message": "Unable to scan verification codes :("
}
```

# <a id="events"></a>/events
This endpoint deals with all functionality centered around getting infromation on Rec Center classes/events. The client may either request events by date or by virality (whose score is calculated from the amount of time until the class/event starts and the number of marks it has recieved). In order to gain access to event/class info, a JSON web token must be provided.
### <a id="events-date"></a>/date : GET
Calling this resource will get information on the Rec Center, sorted by a specified date.</br>
**URL Query Strings:**
- date : The date of the day you want info on in a format that can be converted to an ISO string (e.g. '3-22-17').

**Headers:** 
- authorizationToken : The JSON token given at the time of logging in.

**Body:** None</br>
**Successful Response Example:**
```
{
  "date": "2017-03-22",
  "hours": {
    "close": "19:00",
    "open": "06:00"
  },
  "items": [
    {
      "details": {
        "updated_at": "2017-03-17T03:49:56.257Z",
        "status": "confirmed",
        "end": {
          "dateTime": "2017-03-22T18:30:00-07:00"
        },
        "description": "This class gives you a full body workout using hand weights. You’ll focus on\nbody parts from head to toe and finish with an ab workout.",
        "id": "u99qc48mh0k5h68n5a17qtkpd4",
        "start": {
          "dateTime": "2017-03-22T17:30:00-07:00"
        },
        "title": "Bodyworks + Abs",
        "type": "class"
      },
      "marks": []
    }
  ]
}
```
**Unsuccessful Response Example:**
```
{
  "status": 404,
  "message": "Day not found."
}
```
## <a id="events-viral"></a>/viral : GET
Calling this resource will get information on the Rec Center, sorted by virality score (which is calculated from the amount of time until the class/event starts and the number of marks it has recieved).</br>
**URL Query Strings:**
- start : The index to start collecting from (specifying '30' will start collecting from the 30th most viral item onwards).

**Headers:** 
- authorizationToken : The JSON token given at the time of logging in.

**Body:** None</br>
**Successful Response Example:**
```
  "status": 200,
  "data": {
    "lastEvaluatedKey": 30,
    "items": [
      {
        "updated_at": "2017-01-11T20:06:07.208Z",
        "status": "confirmed",
        "end": {
          "dateTime": "2017-03-22T12:45:00-07:00",
          "timeZone": "America/Los_Angeles"
        },
        "description": "An intense form of interval bike training. Tabata drills consist of 20 seconds of work\nfollowed by 10 seconds of rest. ",
        "id": "ouo22kmr7co6fuc7ov8mrpdbv0_20170322T191500Z",
        "start": {
          "dateTime": "2017-03-22T12:15:00-07:00",
          "timeZone": "America/Los_Angeles"
        },
        "title": "Tabata Cycle",
        "type": "class"
      },
      ...
    ]
  }
}
```
**Unsuccessful Response Example:**
```
{
  "status": 400,
  "message": "Authorization token must be provided."
}
```

# <a id="login"></a>/login
## DELETE
Calling this resource will take a given authorization token and delete it from the database, logging out the user from that specific device.</br>
**URL Query Strings:** None</br>
**Headers:**
- authorizationToken : The JSON token given at the time of logging in.

**Body:** None </br>
**Successful Response Example:**
```
{
  "status": 200
}
```
**Unsuccessful Response Example:**
```
{
  "status": 401,
  "message": "Not a valid token. Access Denied."
}
```
## POST
Calling this resource will take a given email and password combo and attempt to match it to a combo in the database. If the combo is valid, a JSON web token will be returned for the client to use for future authorization.</br>
**URL Query Strings:** None</br>
**Headers:** None</br>
**Body:**
```
{
  "email": "CaptainJack.Sparrow@calbaptist.edu"
  "password": "teamTurner4Lyfe"
}
```
**Successful Response Example:**
```
{
  "status": 200,
  "id": "2c40d650-0d9e-11e7-abce-73b37f3ce4d7",
  "authorizationToken": "eyJhbGciOiJIUzI1NiJ9.VTJGc2RHVmtYMSt1OWxCNHJleFJRMzR6R2RmNkdDZTJ1dVFwV0IzbEpuM3ZpQjZYYUJxMEZFNkVhWk5QbEpNcTRPYTZBbUMwdWZJK0hMRnBZOExJL0ZndDBDRXU3MFlmKzhvc2RZVksxMFZtSlk4ZTZvdlcxTFhaYitKRFRxTGc.AFJVUWuilvznu0CvosEW_MCQRyqpt29UXFyWCe2ad1I"
}
```
**Unsuccessful Response Example:**
```
{
  "status": 404,
  "message": "No users match that email/password combination."
}
```

# <a id="marks"></a>/marks
## GET
Calling this resource will get the classes/events that the client has previously marked.</br>
**URL Query Strings:** None </br>
**Headers:**
- authorizationToken : The JSON token given at the time of logging in.

**Body:** None </br>
**Successful Response Example:**
```
[
  {
    "updated_at": "2017-01-08T01:26:58.649Z",
    "status": "confirmed",
    "end": {
      "dateTime": "2017-03-25T11:00:00-07:00",
      "timeZone": "America/Los_Angeles"
    },
    "description": "Get your feet moving and heart pumping by combining strength and\nendurance conditioning on a stationary bike. An intense form of interval training. Tabata drills consist of 20 seconds of work\nfollowed by 10 seconds of rest. ",
    "id": "u70gnq1u9fdqf1g26l4bc31c2g_20170325T173000Z",
    "start": {
      "dateTime": "2017-03-25T10:30:00-07:00",
      "timeZone": "America/Los_Angeles"
    },
    "title": "Tabata Cycle",
    "type": "class"
  }
]
```
**Unsuccessful Response Example:**
```
{
  "status": 404,
  "message": "No marked data found."
}
```

## DELETE
Calling this resource will unmark a class/event that the client has previously marked.</br>
**URL Query Strings:** 
- eventId: The id of the event to unmark (e.g. u70gnq1u9fdqf1g26l4bc31c2g_20170325T173000Z).

**Headers:**
- authorizationToken : The JSON token given at the time of logging in.

**Body:** None </br>
**Successful Response Example:**
```
{
  "status": 200
}
```
**Unsuccessful Response Example:**
```
{
  "status": 404,
  "message": "No event found."
}
```

## POST
Calling this resource will mark a class/event that the client is interested in.</br>
**URL Query Strings:** 
- eventId: The id of the event to mark (e.g. u70gnq1u9fdqf1g26l4bc31c2g_20170325T173000Z).

**Headers:**
- authorizationToken : The JSON token given at the time of logging in.

**Body:** None </br>
**Successful Response Example:**
```
{
  "status": 200
}
```
**Unsuccessful Response Example:**
```
{
  "status": 403,
  "message": "User has already marked this event"
}
```
