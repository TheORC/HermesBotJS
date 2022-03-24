"use strict";

const logger   = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');
const Slash = require('../../base/Slash.js');

const { DatabaseAdaptar } = require('../../modules/database.js');

const { currentDateToString } = require('../../utils/function.js');

module.exports = class SlashAddQuote extends Slash {

  constructor(client) {
    super(client, {
      name: "addquote",
      description: "Adds a new quote",
      category: "Quote Catagory",
      usage: "/addquote"
    });

    this.slashCommand
      .addUserOption(option => option.setName('person').setDescription('The person who said the quote'))
      .addStringOption(option => option.setName('quote').setDescription('The quote'));
  }

  async run(interaction) {

    try {

      // Create the connections
      const database = new DatabaseAdaptar({
          server:   process.env.db_host,
          username: process.env.db_user,
          password: process.env.db_password,
          database: process.env.db
      });

      // Get commands options
      const quoteUser = interaction.options.getUser('person')
      const quoteData = interaction.options.getString('quote')

      // Add the quote
      await database.insert('user_quotes', {
        guildid: interaction.guild.id,
        userid: quoteUser.id,
        time: currentDateToString(),
        quote: quoteData
      });

      // Diconnect the database, we are done.
      database.disconnect();

      // Finished
      await clientMessenger.log(interaction, 'Quote added.');

    } catch(err) {
      await clientMessenger.error(interaction, 'Can\'t access the database. Occured attempting to access users.');
      logger.error(err);
      database.disconnect();
    }
  }
};
