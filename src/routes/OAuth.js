const Router = require('../classes/Router');
const passport = require('passport');
const Strategy = require('passport-discord').Strategy;
const Calls = require('../database/functions');
const Discord = require('discord.js')
require('dotenv').config();

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

const prompt = 'consent'

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process. env.CLIENT_SECRET,
    callbackURL: process.env.CLIENT_REDIRECT_URI,
    scope: ['identify'],
    prompt: prompt
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
}));

class OAuth extends Router {
    constructor(client) {
        super(client, '/oauth');
    }
    createRoute() {
        this.client.app.use(passport.initialize());
        this.client.app.use(passport.session());
        this.router.get('/login', (req, res, next) => {
            next();
        }, passport.authenticate('discord'));
        this.router.get('/logout', (req, res) => {
            this.client.client.channels.cache.get(process.env.DISCORD_LOG_CHANNEL).send(`${req.user.username}#${req.user.discriminator} (${req.user.id}) has logged out.`)
            req.session.destroy(() => {
                req.logout();
                res.redirect('/');
            });
        });
        this.router.get('/redirect',  passport.authenticate('discord', { failureRedirect: '/?error=true' }), async (req, res) => {
            if (!req.user) return
            const guild = this.client.client.guilds.cache.get(process.env.DISCORD_GUILD)
            if(!guild) {
                return res.send('An error occurred. Code: 11')
            }
            const member = guild.members.cache.get(req.user.id)
            if(!member) {
                return res.send('You must join the Discord to get access!')
            }
            // if (!member.roles.cache.some(role => role.name === 'Access')) {
            //     this.client.client.channels.cache.get('820442132740964352').send(`${req.user.username}#${req.user.discriminator} (${req.user.id}) tried to login but does not have access!`)
            //     return res.redirect('/');
            // }
            const user_schema = {
                user_id: req.user.id,
                user_name: `${req.user.username}#${req.user.discriminator}`,
                user_avatar: req.user.avatar === null ? '' : req.user.avatar,
                dogehouse_token: null,
                dogehouse_refresh_token: null,
            }
            const user = await Calls.getUser(req.user.id)
            if (user === null) {
                await Calls.insertUser(user_schema)
            } else {
                if (req.user.avatar !== user.user_avatar) {
                    await Calls.updateUser(user.user_id, 'user_avatar', req.user.avatar)
                }
                if (`${req.user.username}#${req.user.discriminator}` !== user.user_name) {
                    await Calls.updateUser(user.user_id, 'user_name', `${req.user.username}#${req.user.discriminator}`)
                }
                if (req.user.email !== user.user_email) {
                    await Calls.updateUser(user.user_id, 'user_email', req.user.email)
                }
            }
            req.user.db = user
            res.redirect('/panel');
            this.client.client.channels.cache.get(process.env.DISCORD_LOG_CHANNEL).send(`${req.user.username}#${req.user.discriminator} (${req.user.id}) has logged in.`)
        });
        return this.router;
    }
}

module.exports = OAuth;
