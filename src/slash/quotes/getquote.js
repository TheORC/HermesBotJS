"use strict";

const logger   = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');
const Slash = require('../../base/Slash.js');

const { DatabaseAdaptar } = require('../../modules/database.js');
const { currentDateToString, simpleDate } = require('../../utils/function.js');

const { MessageEmbed } = require('discord.js');

module.exports = class SlashGetQuote extends Slash {

  constructor(client) {
    super(client, {
      name: "getquotes",
      description: "Gets the quotes about a user or the server",
      category: "Quote Catagory",
      usage: "/getquotes user"
    });

    this.slashCommand
      .addSubcommand(subcommand =>
    		subcommand
    			.setName('user')
    			.setDescription('Gets all the quotes said by a person')
    			.addUserOption(option => option.setName('person').setDescription('The person')))
      .addSubcommand(subcommand =>
        subcommand
          .setName('id')
          .setDescription('Gets a quote using a specific id')
          .addNumberOption(option => option.setName('id').setDescription('The quote\'s id')))
    	.addSubcommand(subcommand =>
    		subcommand
    			.setName('all')
    			.setDescription('Gets all the quotes in the server'));
  }

  async run(interaction) {


    const subCommand = interaction.options.getSubcommand();

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

    let cleanedQuotes = [];
    let embedSettings = {
      title: ``,
      description: ``,
      inline: false
    };

    // Check if this is a get for a specific user
    if (subCommand == 'user') {
      const fetchUser = interaction.options.getUser('person')

      // Update the settings
      embedSettings.title = `${fetchUser.username}'s Quotes`;

      const quotes = await db.select('*')
        .where('userid', fetchUser.id)
        .where('guildid', interaction.guild.id)
        .get('user_quotes')


      if (quotes.length > 0){
        for(let i = 0; i < quotes.length; i++){
          const quote = quotes[i]
          cleanedQuotes.push([ `"${quote.quote}"`, `Date: ${simpleDate(quote.time)} - Id: ${quote.quoteid}`])
        }
      }else{
        db.disconnect();
        return await clientMessenger.log(interaction, 'This user does not have any quotes yet.');
      }
    }

    // Check if this is an indevidual id
    else if(subCommand == 'id'){

      const quoteId = interaction.options.getNumber('id')
      const quotes = await db.select('*')
        .where('quoteid', quoteId)
        .where('guildid', interaction.guild.id)
        .get('user_quotes');

      if (quotes.length > 0){
        const quote = quotes[0];
        const user = await interaction.guild.members.fetch(quote.userid);

        const emebed = new MessageEmbed()
          .setTitle(`Quote By, ${user.displayName}`)
          .setDescription(`**"${quote.quote}**"\nDate: ${simpleDate(quote.time)} - Id: ${quote.quoteid}`);

        db.disconnect()
        return await interaction.reply({embeds: [emebed]});

        // cleanedQuotes.push([ `"${quote.quote}"`, `Date: ${simpleDate(quote.time)} - Id: ${quote.quoteid}`])

      }else{
        db.disconnect();
        return await clientMessenger.warn(interaction, `A quote with the id, ${quoteId}, could not be found.`);
      }
    }

    // Other wise just use the server quotes
    else {

      const quotes = await db.select('*')
        .where('guildid', interaction.guild.id)
        .get('user_quotes')

      embedSettings.title = `${interaction.guild.name}'s Quotes`;

      if (quotes.length > 0){
        for(let i = 0; i < quotes.length; i++){
          const quote = quotes[i]
          const user = await interaction.guild.members.fetch(quote.userid)
          cleanedQuotes.push([`"${quote.quote}"`, `**- ${user}**\nDate: ${simpleDate(quote.time)} - Id: ${quote.quoteid}`])
        }
      }else{
        db.disconnect();
        return await clientMessenger.log(interaction, 'This server does not have any quotes yet.');
      }
    }

    // Update the quote count
    embedSettings.description = `There is a total of **${cleanedQuotes.length}** quotes.`;

    // Reply to the interaction
    await interaction.reply({ content: 'Fetched the quotes.', ephemeral: true });

    // Add the embed
    await this.client.embedcontroller.sendEmbedPage(interaction, cleanedQuotes, embedSettings);
    db.disconnect();
  }
};
