const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gendict')
        .setDescription('Generates the initial dictionary of all Beekalicious messages.')
        .setDefaultPermission(true),
    async execute(interaction) {
        await interaction.reply('Generating intial dictionary for Beekalicious!');
    },
};