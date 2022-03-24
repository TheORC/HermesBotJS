"use strict";

const logger   = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');
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
      return await clientMessenger.warn(message.channel, 'Wrong syntax.  Check help for additional information.');
    }

    // Get command information
    const userName = args[0];
    const quote = args.join(' ').split(userName)[1].trim();

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
      await clientMessenger.error(message.channel, 'Can\'t access the database. Occured attempting to access users.');
      database.disconnect();
      return;
    }

    // Extract user information
    const userInfo = getDatabaseCotainsUser(dbusers, userName);
    if(!userInfo){
      return await clientMessenger.warn(message.channel, 'User not found. Please check your spelling.\nIf they don\'t exist, consider adding them.');
    }

    // A user has been found.  Time to add the quote.
    try {
      // Insert
      await database.insert('quotes', {
        iduser: userInfo.iduser,
        idguild: message.guild.id,
        quote_data: quote,
        quote_date: currentDateToString()
      });

      // Finished
      await clientMessenger.log(message.channel, 'Quote added.');
    } catch(err) {
      logger.error(err);
      await clientMessenger.error(message.channel, 'Can\'t access the database. Occured attempting to insert quote.');
      database.disconnect();
      return;
    }

    // Make sure we clean up after ourselves.
    database.disconnect();
  }
};
