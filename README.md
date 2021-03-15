<p align="center">
  <img src="https://cdn.discordapp.com/attachments/820450983892222022/820961073980899328/dogegarden-bottom-cropped.png" alt="DogeGarden logo" />
</p>
<p align="center">
  <strong>An open source website for managing chat bots, rooms and more.</strong>
</p>
<p align="center">
  <a href="https://discord.gg/Nu6KVjJYj6">
    <img src="https://img.shields.io/discord/820442045264691201?style=for-the-badge" alt="discord - users online" />
  </a>
</p>

<h3 align="center">  
  <a href="CONTRIBUTING.md">Contribute (soon)</a>
  <span> · </span>
  <a href="https://discord.gg/Nu6KVjJYj6">Discord</a>
  <span> · </span>
  <a href="https://docs.dogehouse.xyz">Documentation (soon)</a>
</h3>

---

## Branches

- staging -> pr to this branch, here we will review code and contribulate
- master -> don't touch, this is what's running in the production environment

## Installation

1. Clone repository using by running `$ git clone https://github.com/dogegarden/dogehouse-site/` in your terminal
2. Navigate into the directory
3. Install NodeJS and NPM
4. Run `$ npm i` to install the required package's
5. Setup .env file
6. Execute the command `$ npm run dev` in your terminal

### Default .env
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
