const Logger = require('./Logger');
const axios = require('axios')
const Calls = require('../database/functions');
const Discord = require('discord.js')
let client = new Discord.Client();
let { MessageEmbed } = require('discord.js')

client.on('ready', () => {
    Logger.info('Discord signed in.')
    client.user.setPresence({
        status: 'idle',
        activity: {
            name: 'dogehouse.xyz',
            type: 'WATCHING',
        }
    })
})

client.on('message', async (message) => {
    let prefix = '!'

    if (!message.guild) return;
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    
    if (message.content.startsWith('!update')) {
        try {
            if (!message.member.roles.cache.some(role => role.name === '.')) return message.reply('You don\'t have perms for that! \`Code: 0\`')
            let id = message.mentions.members.first() === undefined ? args[1] : message.mentions.members.first().id
            let value;
            let query = args[2]
            value = args[3]
            if (value == 'true') value = true
            if (value == 'false') value = false
            await Calls.updateUser(id, query, value)
            message.channel.send(`**SUCCESS** Updated \`${query}\` to \`${value}\` for <@${id}>.(${id})`)
        } catch (err) {
            message.reply(`An error occurred: ${err}`)
        }
    }

    if (message.content.startsWith('!profile')) {
        try {
            if (!message.member.roles.cache.some(role => role.name === 'Access')) return message.reply('You don\'t have perms for that! \`Code: 0\`')

            let id;

            if(message.member.roles.cache.some(role => role.name === '.')) {
                id = message.mentions.members.first() === undefined ? args[1] : message.mentions.members.first().id
            } else {
                id = message.author.id
            }

            if(!id) {
                id = message.author.id
            }

            const user = await Calls.getUser(id)
            const subusers = await Calls.getSubusers(id)
            const accounts = await Calls.getUserAccounts(id)
            const embed = new MessageEmbed()
            .setTitle(`${user.user_name}'s profile`)
            .setDescription('https://dogehouse.xyz')
            .addField('> Total Accounts', accounts.length)
            .addField('> Total Subusers', subusers.length)
            message.channel.send(embed)
        } catch (err) {
            message.reply(`An error occurred: ${err}`)
        }
    }

})

client.login(process.env.CLIENT_TOKEN)
