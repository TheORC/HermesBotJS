"use strict";

const logger   = require('../../modules/Logger.js');
const Command  = require('../../base/Command.js');

const { DatabaseAdaptar } = require('../../modules/database.js');

module.exports = class RemoveUser extends Command {

  constructor(client) {
    super(client, {
      name: "removeuser",
      description: "Removes a user.",
      category: "Quotes",
      usage: "removeuser [username]",
      aliases: ["ru"]
    });

    this.client = client;
  }

  async run(message, args) {

    if(args.length === 0 || args.length > 1) {
      return await message.channel.send('Command syntax wrong.  Please refer to help.');
    }

    let database;
    try {

      database = new DatabaseAdaptar({
          server:   process.env.db_host,
          username: process.env.db_user,
          password: process.env.db_password,
          database: process.env.db
      });

    }catch(err){
      logger.err(err);
      return await message.channel.send('There was an error talking to the database.');
    }

    try {

      // Get the name of the user being removed
      const userName = args[0];
      const dbUser = await database.where('username', userName).where('idguild', message.guild.id).get('users');

      // Check to see if a user was found
      if(dbUser.length === 0){
        await message.channel.send(`User with username ${userName} was not found.  Check your spelling.`);
        database.disconnect();
        return;
      }

      await database.where('username', userName).where('idguild', message.guild.id).delete('users');
      await message.channel.send('User has been removed.');

    } catch(err) {
      logger.err(err);
      await message.channel.send('There was an error talking to the database');
    }

    database.disconnect();
  }
};
