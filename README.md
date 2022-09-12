# Lobby room for Twilio Video Room using Twilio Sync

## What is it

This application will demonstrate how to add Lobby room to your Twilio video room using Twilio Sync

Tutorial is available [here](https://www.twilio.com/blog/create-a-video-lobby-feature)

### Set up

    cd lobby-room-app
    npm install



- Create an account in the [Twilio Console](https://www.twilio.com/console).
- Click on 'Settings' and take note of your Account SID.
- Create a new API Key in the [API Keys Section](https://www.twilio.com/console/video/project/api-keys) under Programmable Video Tools in the Twilio Console. Take note of the SID and Secret of the new API key.
- Create a new Sync service in the [Services section](https://www.twilio.com/console/sync/services) under the Sync tab in the Twilio Console. Take note of the SID generated.
- Store your Account SID, API Key SID, API Key Secret, and Sync Service SID in a file called `.env` in the root level of the application (example below).

```
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SYNC_SERVICE_SID=ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```


### Run the project locally

    npm start

Access http://localhost:3000/index.html# lobby-room-for-video

### Disclaimer

This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.
