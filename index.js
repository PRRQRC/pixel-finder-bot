const { PixelFinder } = require("./PixelFinder");
const SlashCommandCreator = require("./SlashCommandCreator.js");
const { Client, Intents, MessageAttachment } = require('discord.js');
const MapGenerator = require("./MapGenerator.js");

const clientId = (process.env["clientID"]) ? process.env["clientID"] : require("./config.json").clientId;
const token = (process.env["token"]) ? process.env["token"] : require("./config.json").token;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });
const commands = new SlashCommandCreator(clientId, token, "./commands.js", client);
const finder = new PixelFinder();
const generator = new MapGenerator();

client.once('ready', () => {
  console.log('Ready!');

  console.log("Reloading commands...");
  client.guilds.cache.forEach(guild => {
    commands.reloadCommands(guild.id);
  });
  console.log("Commands reloaded!");
});

commands.on("command", async (interaction) => {
  switch(interaction.commandName) {
    case "get":
      await interaction.deferReply();
      const user = interaction.options.getString("user");

      finder.requestData(user).then(async (data) => {
        const attachment = new MessageAttachment(generator.generateMap(finder.convert(data.data)), user + ".png");

        await interaction.editReply({ content: formatTextResponse(user, finder.convert(data.data)), files: [ attachment ] });
      }).catch(async (err) => {
        await interaction.editReply({ content: "User not found!" });
      });
    break;
    default:
      console.log("Unknown command!");
    break;
  }
});

function formatTextResponse(username, data) {
  let text = username + "'s stats for r/place 2022: \n\n";
  text += "Pixels placed: `" + data.pixelCount + "`\n";
  text += "Hash: `" + data.hash + "`\n";
  return text;
}

client.login(token);

// https://discord.com/api/oauth2/authorize?client_id=985073004826480640&permissions=8&scope=bot%20applications.commands
