1. Clone repository using by running `$ git clone https://github.com/dogegarden/dogehouse-site/` in your terminal
2. Navigate into the directory
3. Install NodeJS and NPM
4. Run `$ npm i` to install the required packages
5. Execute the command `$ npm run dev` in your terminal

The .env file explained

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

DOGEHOUSE_TOKEN= - follow instructions below
DOGEHOUSE_REFRESH_TOKEN= - follow instructions below
Go to https://dogehouse.tv
Open Developer options (F12 or Ctrl+Shift+I)
Go to Application > Local Storage > dogehouse.tv
Copy your token and refresh-token and put them in an .env file

DOGEHOUSE_WSS=wss://api.dogehouse.tv/socket - socket url for main dogehouse servers, dont change unless youre switching to your own or staging

REDIS_HOST=REDDIS HOST - setup reddis with host and pass
REDIS_PASS=REDDIS PASS - setup reddis with host and pass
```
