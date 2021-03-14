const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const objectIDRegexp = new RegExp('^[0-9a-fA-F]{24}$');

const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

const axios = require('axios');
const { nanoid } = require('nanoid');
const monk = require('monk');
const { createNodeRedisClient } = require('handy-redis');

const db = monk(process.env.MONGO_URL);
const client = createNodeRedisClient({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASS
});

class Calls {
    static async getUser(id) {
        const collection = db.get('users')
        return (await collection.findOne({ user_id: id }))
    }

    static async deleteSubuser(subuser) {
        const collection = db.get('users')
        await collection.findOneAndUpdate({ user_id: subuser }, { $set: { user_active: false } })
        return (await collection.findOneAndUpdate({ user_id: subuser }, { $set: { sub_user: 'NONE' } }))
    }

    static async addSubuser(subuser, owner) {
        const collection = db.get('users')
        await collection.findOneAndUpdate({ user_id: subuser }, { $set: { user_active: true } })
        return (await collection.findOneAndUpdate({ user_id: subuser }, { $set: { sub_user: owner } }))
    }
    
    static async updateUser(id, query, value) {
        const collection = db.get('users')
        return (await collection.findOneAndUpdate({ user_id: id }, { $set: { [query]: value } }))
    }

    static async updateBot(id, query, value) {
        const collection = db.get('bots')
        return (await collection.findOneAndUpdate({ _id: id }, { $set: { [query]: value } }))
    }

    static async getSubusers(id) {
        const collection = db.get('users')
        return (await collection.find({ sub_user: id }))
    }

    static async insertUser(props) {
        const collection = db.get('users')
        return (await collection.insert(props))
    }

    static async getToken(id) {
        const token = nanoid(48)
        await client.set(`token_${id}`, `${token}`)
        await client.expire(`token_${id}`, 5)
        return token
    }

    static async isValidToken(id, tkn) {
        const token = await client.get(`token_${id}`)
        if(token === undefined || token === null) return false
        return token === tkn
    }

    static async deleteToken(id) {
        return (await client.del(`token_${id}`))
    }
}

module.exports = Calls;
