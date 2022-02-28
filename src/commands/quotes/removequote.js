"use strict";

const logger   = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');
const Command  = require('../../base/Command.js');

const { isNumeric } = require('../../utils/function.js');
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
      return await clientMessenger.warn(message.channel, 'Wrong syntax.  Check help for additional information.');
    }

    // Check the args validity
    const quoteId = args[0];
    if(!isNumeric(quoteId)){
      return await clientMessenger.warn(message.channel, 'Make sure you enter a proper ID (numeric).');
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
      logger.error(err);
      await clientMessenger.error(message.channel, 'Can\'t access the database.');

      if(database !== undefined){
        database.disconnect();
      }
      return;
    }

    // Perform the command.
    try {

      const quoteId = parseInt(args[0]);
      const quote = await database.select('idquote').where('idquote', quoteId).where('idguild', message.guild.id).get('quotes');

      // Check if something was returned
      if(quote.length === 0) {
        await clientMessenger.warn(message.channel, `No quote with id (${quoteId}) was found.`);
        database.disconnect();
        return;
      }

      // Remove the quote
      await database.where('idquote', quoteId).where('idguild', message.guild.id).delete('quotes');
      await clientMessenger.log(message.channel, `Removed quote with ID ${quoteId}.`);

    } catch(err) {
      logger.error(err);
      await clientMessenger.error(message.channel, 'Can\'t access the database.');
    }

    database.disconnect();
  }
};
