const fs = require('node:fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token, guilds } = require('./config.json');

const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

async function deployCommands(guildId) {
	try {
		console.log(`Started refreshing application (/) commands for ${guildId}.`);

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands }
		);

		console.log(`Successfully reloaded application (/) commands for ${guildId}.`);
	} catch (error) {
		console.error(error);
	}
}

(async () => {
	guilds.forEach(guildId => deployCommands(guildId));
})();