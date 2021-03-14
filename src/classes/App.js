const Discord = require('discord.js')
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const MongoStore = require('connect-mongo')(session);
const logger = require('morgan');
const Router = require('./Router');
const Logger = require('../util/Logger');
const Calls = require('../database/functions')
require('dotenv').config();

class App {
    io;
    server;
    constructor() {
            this.app = express();
            this.server = require('http').createServer(this.app);
            this.io = require('socket.io')(this.server)
            this.client = new Discord.Client();
            this.client.login(process.env.CLIENT_TOKEN)
            this.app.engine('e', require('ejs').renderFile);
            this.app.set('view engine', 'ejs');
            this.app.set('views', path.join(__dirname, '..', 'views'));
            this.app.use(cors());
            this.app.use(cookieParser());
            logger.token('userName', function(req, res) { return (req.session && req.session.passport && req.session.passport.user) ? `${req.session.passport.user.username}#${req.session.passport.user.discriminator}` : '' })
            this.app.use(logger(':method :url :status :res[content-length] - :response-time ms - :userName'));
            this.app.use(express.json());
            this.app.use(express.urlencoded({ extended: true }));
            this.app.use('/public', express.static(path.join(__dirname, '..', 'public')));
            this.app.use(session({
                store: new MongoStore({ checkPeriod: 86400000, url: process.env.MONGO_URL }),
                resave: false,
                saveUninitialized: false,
                secret: process.env.SESSION_SECRET
            }));
        }
        /**
         * 
         * @param {express.Request} req 
         * @param {express.Response} res 
         * @param {function()} next 
         */

    async Authentication(req, res, app, next) {
            if (req.isAuthenticated()) {
                const user = await Calls.getUser(req.user.id)
                if (user !== null) {

                }
                const guild = app.client.guilds.cache.get('820442045264691201')
                if (!guild) {
                    return res.send('An error occurred. Code: 11')
                }
                const member = guild.members.cache.get(req.user.id)
                if (!member) {
                    return res.send('You must join the Discord to get access!')
                }
                return next();
            }
            res.redirect('/oauth/login');
        }
        /**
         * 
         * @param {string} template 
         * @param {express.Request} req 
         * @param {express.Response} res 
         * @param {{...}} data 
         */

    async registerRoutes() {
            const filePath = path.join(__dirname, '..', 'routes');
            const files = await fs.readdir(filePath);
            for await (const file of files) {
                if (file.endsWith('.js')) {
                    const router = require(path.join(filePath, file));
                    if (router.prototype instanceof Router) {
                        const instance = new router(this);
                        Logger.route(`Route File ${instance.path} running.`);
                        if (instance.auth) {
                            this.app.use(instance.path, this.Authentication, instance.createRoute());
                        } else {
                            this.app.use(instance.path, instance.createRoute());
                        }
                    }
                }
            }

            this.app.get('/', function(req, res) {
                res.render('index.ejs', {
                    path: req.path,
                    user: req.user,
                })
            })

            this.app.get('/panel', this.Authentication, async function(req, res, next) {
                const db = await Calls.getUser(req.user.id)
                res.render('panel.ejs', {
                    path: req.path,
                    user: req.user,
                    db
                })
            })

            this.app.get('/activation', async function(req, res) {
                let user = await Calls.getUser(req.user.id)
                res.render('activation.ejs', {
                    path: req.path,
                    user: req.user
                })
            })

            this.app.get('/panel/settings', this.Authentication, async function(req, res, next) {
                const db = await Calls.getUser(req.user.id)
                let error, message, success

                success = false
                error = false
                message = null
                if (req.query.err) {
                    error = true
                    message = req.query.err
                }
                if (req.query.success) success = true
                res.render('settings.ejs', {
                    path: req.path,
                    user: req.user,
                    db,
                    success,
                    error,
                    message,
                })
            })

            this.app.get('/panel/rooms', this.Authentication, async function(req, res, next) {
                const db = await Calls.getUser(req.user.id)
                let error, message, success

                const readline = require("readline");
                const connect = require('./connection');

                const logger = (direction, opcode, data, fetchId, raw) => {
                    const directionPadded = direction.toUpperCase().padEnd(3, " ");
                    const fetchIdInfo = fetchId ? ` (fetch id ${fetchId})` : "";
                    console.info(`${directionPadded} "${opcode}"${fetchIdInfo}: ${raw}`);
                };


                const connection = await connect(
                    process.env.DOGEHOUSE_TOKEN,
                    process.env.DOGEHOUSE_REFRESH_TOKEN, {}
                );

                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                    prompt: `${connection.user.displayName} > `
                })

                const rooms = await connection.fetch("get_top_public_rooms", { cursor: 0 });
                console.log(rooms)
                success = false
                error = false
                message = null
                if (req.query.err) {
                    error = true
                    message = req.query.err
                }
                if (req.query.success) success = true
                res.render('rooms.ejs', {
                    path: req.path,
                    user: req.user,
                    rooms: rooms.rooms,
                    success,
                    error,
                    message,
                    db
                })
            })

            //404 page.
            this.app.use((req, res) => {
                res.render('404.ejs', { path: req.path, user: req.user });
            });


        } // registerRoutes
        
    async listen(fn, https = false) {
        this.server.listen(process.env.PORT, fn);
    }
}

module.exports = App;