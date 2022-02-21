"use strict";

const { defaultSettings } = require('../config.js');
const { ready } = require('../modules/Logger.js');

module.exports = class {

  constructor(client) {
    this.client = client;
  }

  async run() {

    if (!defaultSettings) { throw new Error('defaultSettings not preset in config.js or settings database. Bot cannot load.'); }

    // Set the game as the default help command + guild count.
    // NOTE: This is also set in the guildCreate and guildDelete events!
    this.client.user.setActivity(`${defaultSettings.prefix}help`);

    // Log that we're ready to serve, so we know the bot accepts commands.
    ready(`${this.client.user.tag}, ready to serve ${this.client.users.cache.size} users in ${this.client.guilds.cache.size} servers.`);
  }
};
