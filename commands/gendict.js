const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

const isUserBeekalicious = userId => {
    if (userId === '298600019169116166') {
        return true;
    }
}

async function fetchAllMessages(channel) {
    let messages = [];

    // Create message pointer
    let message = await channel.messages
        .fetch({ limit: 1 })
        .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null))
        .catch(console.error);

    while (message) {
        await channel.messages
            .fetch({ limit: 100, before: message.id })
            .then(messagePage => {
                messagePage.forEach(msg => messages.push(msg));

                // Update our message pointer to be last message in page of messages
                message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
            })
            .catch(console.error);
    }

    return messages;
}

async function getGuilds(guildCollection) {
    const guilds = guildCollection.map(oauth2Guild => oauth2Guild.fetch());

    return Promise.all(guilds);
}

async function getChannels(guilds) {
    const channels = guilds.map(guild => guild.channels.fetch());

    return Promise.all(channels);
}

async function getMessages(channels) {
    const messages = channels.map(channel => fetchAllMessages(channel));

    return Promise.all(messages);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gendict')
        .setDescription('Generates the initial dictionary of all Beekalicious messages.')
        .setDefaultPermission(true),
    async execute(interaction) {
        await interaction.reply('Generating intial dictionary for Beekalicious! This may take a few mins...');

        // fetch guilds, channels, and messages
        const guildCollection = await interaction.client.guilds.fetch();
        const guilds = await getGuilds(guildCollection);
        const channelList = await getChannels(guilds)
            .then(channelCollection => {
                let channels = [];
                channelCollection.forEach(channelsMap => {
                    channelsMap.forEach(channel => {
                        channels.push(channel);
                    })
                })
                return channels.filter(channel => {
                    if (channel.type === 'GUILD_TEXT') {
                        return channel;
                    }
                });
            });
        const messageList = await getMessages(channelList)
            .then(messages => {
                return messages.flat().filter(message => {
                    if (isUserBeekalicious(message.author.id)) {
                        return message;
                    }
                });
            });

        fs.writeFile('test.json', JSON.stringify(messageList.map(message => message.content)), err => {
            if (err) {
                console.error(err);
                return;
            }
        })

        await interaction.followUp('Done generating db!');
    },
};