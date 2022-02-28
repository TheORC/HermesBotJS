"use strict";

const clientMessenger = require('../modules/clientmessenger.js');
const logger = require('../modules/Logger.js');

module.exports = class {

  constructor(client) {
    this.client = client;
  }

  async run(reaction, user) {

    // We don't care about bot reactions
    if(user.bot){
      return;
    }

    // Check if this message has multiple pages
    if(!this.client.embedcontroller.check(reaction.message.id)){
      return;
    }

    // Update the embed page.
    try {
      await this.client.embedcontroller.updatePage(reaction.message.id, reaction);
    }catch(err){
      logger.error(err);
      await clientMessenger.error(reaction.message.channel, 'An error occured processing the request.');
    }

    // This message has multiple pages.  Lets handle the event.
    await reaction.users.remove(user);
  }
};
