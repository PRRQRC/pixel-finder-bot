const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const EventEmitter = require('events');

class SlashCommandCreator {
  constructor(clientId, token, commandFile, client) {
    this.commands = require(commandFile);
    this.commands = this.commands.map(command => command.toJSON());

    this.clientId = clientId;
    this.token = token;
    this.client = client;

    this.rest = new REST({ version: '9' }).setToken(this.token);
    this.emitter = new EventEmitter();

    this.setupReplies();

    return this;
  }
  on(event, listener) {
    this.emitter.on(event, listener);
  }
  once(event, listener) {
    this.emitter.once(event, listener);
  }
  setupReplies() {
    this.client.on("interactionCreate", interaction => {
      if (!interaction.isCommand()) return;

      this.emitter.emit("command", interaction);
    })
  }

  async reloadCommands(guildId) {
    return new Promise(async (res, rej) => {
      try {
        await this.rest.put(
          Routes.applicationGuildCommands(this.clientId, guildId),
          { body: this.commands },
        );
        res();
      } catch (error) {
        rej(error);
      }
    });
  }
}

module.exports = SlashCommandCreator;
