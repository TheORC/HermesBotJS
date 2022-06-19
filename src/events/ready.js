"use strict";
const logger = require("../modules/Logger.js");

const { defaultSettings, app_settings } = require('../config.js');
const { ready } = require('../modules/Logger.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = class {

  constructor(client) {
    this.client = client;
  }

  async run() {

    if (!defaultSettings) { throw new Error('defaultSettings not preset in config.js or settings database. Bot cannot load.'); }

    // Set the game as the default help command + guild count.
    // NOTE: This is also set in the guildCreate and guildDelete events!
    this.client.user.setActivity(`${defaultSettings.prefix}help`);

    await this.registerGuildSlashCommands();

    // Log that we're ready to serve, so we know the bot accepts commands.
    ready(`${this.client.user.tag}, ready to serve ${this.client.users.cache.size} users in ${this.client.guilds.cache.size} servers.`);
  }

  async registerGuildSlashCommands() {

    // Place your client and guild ids here
    const clientId = app_settings.discord_client_id;
    const guildId = app_settings.discord_guild_id;

    const rest = new REST({ version: '9' }).setToken(app_settings.discord_token);

    let commands = [];
    for(const key of this.client.container.slashcmds) {
      commands.push(key[1].toJSON());
    }

    try {

  		logger.log('Started refreshing application (/) commands.');

  		await rest.put(
  			Routes.applicationGuildCommands(clientId, guildId), { body: commands },
  		);

	    logger.log('Successfully reloaded application (/) commands.');
      
  	} catch (error) {
		  logger.error(error);
  	}
  }
};
