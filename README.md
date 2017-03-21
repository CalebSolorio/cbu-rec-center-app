# CBU REC Center App

#### API Endpoint: https://1fgs4l61r4.execute-api.us-east-1.amazonaws.com/Sprint2

## API Resources
- ##### [/code](#code):
   - ###### [/send](#code-send) : Send verification code.
   - ###### [/resend]("#code-resend") : Resend verification code.
   - ###### [/verify]("#code-verify") : Verify verification code.
- ##### [/events]("#events"):
    - ###### [/date]("#events-date"): Get events by date.
    - ###### [/viral]("#events-viral"): Get events by virality.
- ##### [/login]("#login") : Log users in and out.
- ##### [/marks]("#marks") : Mark/unmark events and get events marked.
- ##### [/user]("#user") : Create/read/update/delete user info.

## <a id="code"></a>/code
This endpoint deals with all functionality centered around verification codes. To prove they are a part of the CBU community, users will be required to provide their personal 'calbaptist.edu' email address. A 6-digit verification code will be sent to this address and must be provided at the time of registration.
#### <a id="code-send"></a>/send : POST
Calling this resource will send a verification code to the specified email address, provided it's a valid 'calbaptist.edu' email address.
**URL Query Strings Required:** None
**Headers Required:** None
**Body Format:**
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
#### <a id="code-resend"></a>/resend : POST
Calling this resource will resend a verification code to the specified email address, provided it's a valid 'calbaptist.edu' email address and a code has already been sent once before.
**URL Query Strings Required:** None
**Headers Required:** None
**Body Format:**
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

#### <a id="code-verify"></a>/verify : POST
Calling this resource will check if the given email matches the given verification code, returning either true or false; however, it will not remove the code from the database. This makes it possible to check a verification code's validity before allowing to user to fill out their personal details.
**URL Query Strings Required:** None
**Headers Required:** None
**Body Format:**
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
