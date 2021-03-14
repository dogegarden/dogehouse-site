const Router = require('../classes/Router');
// const SocketHandler = require('../util/SocketHandler'); Not needed - for now.
const Calls = require('../database/functions');

class API extends Router {
    constructor(client) {
        super(client, '/api');
    }
    createRoute() {

        this.router.post('/settings/save', async (req, res) => {
            try {
                if (req.session.passport.user.id !== req.body.id) {
                    return res.redirect('/panel/settings?err=You are not allowed to do that!')
                }
                if(!req.body.token) {
                    return res.redirect('/panel/settings?err=You must specify a token!')
                }
                if(!req.body.refresh_token) {
                    return res.redirect('/panel/settings?err=You must specify a refresh token!')
                }

                await Calls.updateUser(req.body.id, 'dogehouse_token', req.body.token)
                await Calls.updateUser(req.body.id, 'dogehouse_refresh_token', req.body.refresh_token)
                res.redirect('/panel/settings?success=true')
            } catch (e) {
                return res.redirect('/panel/settings?err=An error occurred.')
            }
        })
        
        this.router.post('/token', async (req, res) => {
            res.status(200).json({
                token: await Calls.getToken(req.session.passport.user.id)
            })
        })
        return this.router
    }
}

module.exports = API;