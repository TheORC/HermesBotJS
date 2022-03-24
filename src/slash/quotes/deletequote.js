"use strict";

const logger   = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');
const Slash = require('../../base/Slash.js');

const { DatabaseAdaptar } = require('../../modules/database.js');
const { currentDateToString, simpleDate } = require('../../utils/function.js');

module.exports = class SlashDeleteQuote extends Slash {

  constructor(client) {
    super(client, {
      name: "deletequotes",
      description: "Deletes a quote from the server",
      category: "Quote Catagory",
      usage: "/deletequotes id"
    });

    this.slashCommand.addNumberOption(option => option.setName('id').setDescription('The id of the quote to be deleted'));
  }

  async run(interaction) {

    let db;
    try {
      // Create the connections
       db = new DatabaseAdaptar({
          server:   process.env.db_host,
          username: process.env.db_user,
          password: process.env.db_password,
          database: process.env.db
      });
    } catch(err) {
      await clientMessenger.error(interaction, 'Can\'t access the database.');
      logger.error(err);
      db.disconnect();
    }

    const quoteId = interaction.options.getNumber('id');
    const quote = await db.select('*')
                          .where('quoteid', quoteId)
                          .where('guildid', interaction.guild.id)
                          .get('user_quotes');

    // Check if the quote exists
    if (quote.length == 0){
      return await clientMessenger.warn(interaction, `Quote with id, ${quoteId}, could not be found.`);
    }

    await db.where('quoteid', quoteId).where('guildid', interaction.guild.id).delete('user_quotes');
    await clientMessenger.log(interaction, `Quote with id, ${quoteId}, was deleted.`);

    db.disconnect()
  }
};
