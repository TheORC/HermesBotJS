"use strict";

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
      console.log(err);
      await reaction.message.channel.send('An error occured processing the request.');
    }

    // This message has multiple pages.  Lets handle the event.
    await reaction.users.remove(user);
  }
};
