const fs = require('fs');

const isUserBeekalicious = userId => {
    if (userId === '298600019169116166') {
        return true;
    }
}

async function fetchAllMessages(channel) {
    console.log(channel);
    let messages = [];

    // Create message pointer
    let message = await channel.messages
        .fetch({ limit: 1 })
        .then(messagePage => (messagePage.size === 1 ? messagePage.at(0) : null));

    while (message) {
        await channel.messages
            .fetch({ limit: 100, before: message.id })
            .then(messagePage => {
                messagePage.forEach(msg => messages.push(msg));

                // Update our message pointer to be last message in page of messages
                message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
            })
    }

    return messages;
}

module.exports = {
    name: 'ready',
    execute(client) {
        // big dick bandits server
        let guild = client.guilds.resolve("387735421884432386");

        console.log(`Ready! Logged in as ${client.user.tag}`);
        console.log(`${guild}`);

        let channelList = [];
        let messageList = [];
        guild.channels.fetch()
            .then(channels => {
                console.log(`Got ${channels.size} channels.`)

                channels.forEach(channel => {
                    if (channel.type === 'GUILD_TEXT' && channel.name) {
                        channelList.push(channel);
                    }
                })
                fetchAllMessages(channelList[0])
                    .then(messages => {
                        messages.forEach(message => {
                            if (isUserBeekalicious(message.author.id)) {
                                messageList.push(message.content);
                            }
                        });
                        // console.log(messageList);
                        fs.writeFile('test.json', JSON.stringify(messageList), err => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                        })
                    });
            })
            .catch(console.error);
    },
};