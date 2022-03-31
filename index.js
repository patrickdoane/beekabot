const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const bot_token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
    console.log('Ready!');
})

client.login(bot_token);