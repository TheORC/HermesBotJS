"use strict";

const Command  = require('../../base/Command.js');
const logger   = require('../../modules/Logger.js');

const { DatabaseAdaptar } = require('../../modules/database.js');
const { getDatabaseCotainsUser } = require('../../utils/function.js');

module.exports = class AddQuote extends Command {

  constructor(client) {
    super(client, {
      name: "adduser",
      description: "Adds a new user.",
      category: "Quotes",
      usage: "adduser [username]",
      aliases: ["au"]
    });

    this.client = client;
  }

  async run(message, args) {

    if(args.length > 1 || args.length === 0){
      return await message.channel.send('Command syntax wrong.  Please refer to help.');
    }

    // Get command information
    const userName = args[0];

    // Create a database connections
    let database, dbusers;
    try {

      // Create the connections
      database = new DatabaseAdaptar({
          server:   process.env.db_host,
          username: process.env.db_user,
          password: process.env.db_password,
          database: process.env.db
      });

      // Get the user list
      dbusers = await database.select(['iduser', 'username']).where('idguild', message.guild.id).get('users');
    } catch(err) {
      logger.error(err);
      database.disconnect();
      return await message.channel.send('There was an error talking to the database.');
    }

    // Extract user information
    const userInfo = getDatabaseCotainsUser(dbusers, userName);

    // Check
    if(userInfo){
      return await message.channel.send('This user is already in the database.');
    }

    // A user has been found.  Time to add the quote.
    try {
      // Insert
      await database.insert('users', {
        idguild: message.guild.id,
        username: userName
      });

      // Finished
      await message.channel.send(`Added user (${userName}).`);
    } catch(err) {
      logger.error(err);
      database.disconnect();
      return await message.channel.send('There was an error inserting in to the database.');
    }

    // Make sure we clean up after ourselves.
    database.disconnect();
  }
};
