"use strict";

const logger   = require('../../modules/Logger.js');
const Command  = require('../../base/Command.js');

const { DatabaseAdaptar } = require('../../modules/database.js');

module.exports = class RemoveQuote extends Command {

  constructor(client) {
    super(client, {
      name: "removequote",
      description: "Removes a quote.",
      category: "Quotes",
      usage: "removequote [quote id]",
      aliases: ["rq"]
    });

    this.client = client;
  }

  async run(message, args) {

    // Check the command syntax
    if (args.length === 0 || args.length > 1) {
      return await message.channel.send('Command syntax wrong.  Please refer to help.');
    }

    // Create connection to the database
    let database;
    try {
      database = new DatabaseAdaptar({
          server:   process.env.db_host,
          username: process.env.db_user,
          password: process.env.db_password,
          database: process.env.db
      });
    } catch(err) {
      logger.err(err);
      return await message.channel.send('There was an error talking to the database');
    }

    // Perform the command.
    try {

      const quoteId = parseInt(args[0]);
      const quote = await database.select('idquote').where('idquote', quoteId).where('idguild', message.guild.id).get('quotes');

      // Check if something was returned
      if(quote.length === 0) {
        await message.channel.send(`No quote with id (${quoteId}) was found.`);
        database.disconnect();
        return;
      }

      // Remove the quote
      await database.where('idquote', quoteId).where('idguild', message.guild.id).delete('quotes');
      await message.channel.send(`Quote with id ${quoteId} removed.`);

    } catch(err) {
      logger.err(err);
      await message.channel.send('There was an error talking to the database');
    }

    database.disconnect();
  }
};
