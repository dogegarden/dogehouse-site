1. Clone repo
2. cd to directory
3. npm i to install
4. fill out everything in the .env
5. use npm run dev to run in development with nodemon


.env explained

```
PORT=3071

DISCORD_TOKEN=YOUR DISCORD BOT TOKEN
DISCORD_LOG_CHANNEL=LOGGING CHANNEL
DISCORD_GUILD=GUILD ID

MONGO_URL=MONGO DB CONNECTION URI
SESSION_SECRET=RANDOM SHA CODE

CLIENT_SECRET=DISCORD CLIENT SECRET
CLIENT_ID=DISCORD CLIENT ID
CLIENT_TOKEN=YOUR DISCORD BOT TOKEN
CLIENT_REDIRECT_URI=http://localhost:3071/oauth/redirect - Redirect url need to add this under oauth in discord dev portal!!!

DOGEHOUSE_TOKEN= - get this from local storage, can someone pr this more in depth
DOGEHOUSE_REFRESH_TOKEN= - get this from local storage, can someone pr this more in depth
DOGEHOUSE_WSS=wss://api.dogehouse.tv/socket - socket url for main dogehouse servers, dont change unless youre switching to your own or staging

REDIS_HOST=REDDIS HOST - setup reddis with host and pass
REDIS_PASS=REDDIS PASS - setup reddis with host and pass
```
