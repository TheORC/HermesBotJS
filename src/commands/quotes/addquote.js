"use strict";

const logger   = require('../../modules/Logger.js');
const Command  = require('../../base/Command.js');

const { DatabaseAdaptar } = require('../../modules/database.js');
const { currentDateToString, getDatabaseCotainsUser } = require('../../utils/function.js');

module.exports = class AddQuote extends Command {

  constructor(client) {
    super(client, {
      name: "addquote",
      description: "Adds a new quote.",
      category: "Quotes",
      usage: "addquote [username] [quote]",
      aliases: ["aq"]
    });

    this.client = client;
  }

  async run(message, args) {

    // Check the command syntax
    if(args.length <= 1){
      return await message.channel.send('Command syntax wrong.  Please refer to help.');
    }

    // Get command information
    const userName = args[0];
    const quote = args.join(' ').split(userName)[1].trim();

    // Create a database connections
    let database, dbusers;
    try {

      // Create the connections
      database = new DatabaseAdaptar({server: 'localhost', username: 'root', password: 'Letmein21', database: 'hermes'});

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
    if(!userInfo){
      return await message.channel.send('User not found.  Please check your spelling or add them.');
    }

    // A user has been found.  Time to add the quote.
    try {
      // Insert
      let info = await database.insert('quotes', {
        iduser: userInfo.iduser,
        idguild: message.guild.id,
        quote_data: quote,
        quote_date: currentDateToString()
      });

      // Finished
      await message.channel.send('Added a new quote with the id: ' + info.insertId);
    } catch(err) {
      logger.error(err);
      database.disconnect();
      return await message.channel.send('There was an error inserting in to the database.');
    }

    // Make sure we clean up after ourselves.
    database.disconnect();
  }
};
