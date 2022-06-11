const { SlashCommandBuilder } = require('@discordjs/builders');
const { Options } = require('discord.js');

module.exports = [
  new SlashCommandBuilder()
    .setName("get")
    .setDescription("Retrieve the stats of a reddit user for r/place 2022")
    .addStringOption(option => 
      option.setName("user")
        .setDescription("The reddit username of the user")
        .setRequired(true))
]
