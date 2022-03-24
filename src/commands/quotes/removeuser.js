"use strict";

const logger   = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');
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
      return await clientMessenger.warn(message.channel, 'Wrong syntax.  Check help for additional information.');
    }

    let database;
    try {

      database = new DatabaseAdaptar({
          server:   process.env.db_host,
          username: process.env.db_user,
          password: process.env.db_password,
          database: process.env.db
      });

    } catch(err) {
      logger.error(err);
      await clientMessenger.error(message.channel, 'Can\'t access the database.');

      if(database !== undefined){
        database.disconnect();
      }
      return;
    }

    try {

      // Get the name of the user being removed
      const userName = args[0];
      const dbUser = await database.where('username', userName).where('idguild', message.guild.id).get('users');

      // Check to see if a user was found
      if(dbUser.length === 0){
        await clientMessenger.warn(message.channel, `User with username ${userName} was not found.  Check your spelling.`);
        database.disconnect();
        return;
      }

      await database.where('username', userName).where('idguild', message.guild.id).delete('users');
      await clientMessenger.log(message.channel, 'User has been removed.');

    } catch(err) {
      logger.error(err);
      await clientMessenger.error(message.channel, 'There was an error talking to the database');
    }

    database.disconnect();
  }
};
