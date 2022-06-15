const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = [
  new SlashCommandBuilder()
    .setName("get")
    .setDescription("Retrieve the stats of a reddit user for r/place 2022")
    .addStringOption(option => 
      option.setName("user")
        .setDescription("The reddit username of the user")
        .setRequired(true))
    .addBooleanOption(option => 
      option.setName("trophies")
      .setDescription("Set this to false to load results faster, but without trophies.")
      .setRequired(true)),
  new SlashCommandBuilder()
    .setName("getjson")
    .setDescription("Get the stats sent to you via dms as json - ONLY works for users with direct messages enabled!")
    .addStringOption(option =>
      option.setName("user")
        .setDescription("The reddit username of the user")
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName("trophies")
      .setDescription("Set this to false to load results faster, but without trophies.")
      .setRequired(true))
]
