const { PixelFinder } = require("./PixelFinder");
const SlashCommandCreator = require("./SlashCommandCreator.js");
const { Client, Intents, MessageAttachment } = require('discord.js');
const MapGenerator = require("./MapGenerator.js");

const fs = require("fs");

const clientId = (process.env["clientID"]) ? process.env["clientID"] : require("./config.json").clientId;
const token = (process.env["token"]) ? process.env["token"] : require("./config.json").token;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });
const commands = new SlashCommandCreator(clientId, token, "./commands.js", client);
const finder = new PixelFinder();
const generator = new MapGenerator();

const formatTemplate = fs.readFileSync("data/template.txt", "utf8");

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
        if (!err.status) console.log(err);
        await interaction.editReply({ content: "User not found!" });
      });
    break;
    default:
      console.log("Unknown command!");
    break;
  }
});

function formatTrophies(trophies) {
  let st = ["~~", "~~", "~~"];
  trophies.trophies.forEach(trophy => {
    st[trophy] = "";
  });
  let text = st[0] + "First Placer (green): `" + trophies.trophyPixels[0] + "`" + st[0] + "\n";
  text += st[1] + "Final Canvas (yellow): `" + trophies.trophyPixels[1] + "`" + st[1] + "\n";
  text += st[2] + "End Game (blue): `" + trophies.trophyPixels[2] + "`" + st[2];
  return text;
}
function formatTextResponse(username, data) {
  let text = formatTemplate.repeat(1);
  return text.replace(/(%{username})/gi, username).replace(/(%{trophies})/gi, formatTrophies(data)).replace(/(%{hash})/gi, data.hash).replace(/(%{pixelCount})/gi, data.pixelCount);
}

client.login(token);

// https://discord.com/api/oauth2/authorize?client_id=985073004826480640&permissions=8&scope=bot%20applications.commands
