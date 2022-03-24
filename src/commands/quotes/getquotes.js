"use strict";

const logger   = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');

const Command  = require('../../base/Command.js');

const { DatabaseAdaptar } = require('../../modules/database.js');
const { getDatabaseCotainsUser, simpleDate } = require('../../utils/function.js');

module.exports = class GetQuotes extends Command {

  constructor(client) {
    super(client, {
      name: "getquotes",
      description: "Retreives user or guild quotes.",
      category: "Quotes",
      usage: "getquotes [none|username]",
      aliases: ["gq"]
    });
  }

  async run(message, args) {

    if(args.length > 1){
      return await clientMessenger.warn(message.channel, 'Wrong syntax.  Check help for additional information.');
    }

    // Check if a username was provided
    if(args.length === 1) {

      const userName = args[0];

      // Get users from the database.
      let db, dbusers;
      try {
        db = new DatabaseAdaptar({
            server:   process.env.db_host,
            username: process.env.db_user,
            password: process.env.db_password,
            database: process.env.db
        });
        dbusers = await db.select(['iduser', 'username']).where('idguild', message.guild.id).get('users');
      } catch(err) {
        logger.error(err);
        await clientMessenger.error(message.channel, 'Can\'t access the database. Occured attempting to access users.');
        db.disconnect();
        return;
      }

      // Extract user information
      const userInfo = getDatabaseCotainsUser(dbusers, userName);
      if(!userInfo){
        return await clientMessenger.warn(message.channel, 'User not found. Please check your spelling.\nIf they don\'t exist, consider adding them.');
      }

      let quotes;
      try {

        quotes = await db
          .select(['idquote', 'quote_data', 'quote_date'])
          .where('idguild', message.guild.id)
          .where('iduser', userInfo.iduser)
          .get('quotes');

      } catch(err) {
        logger.error(err);
        await clientMessenger.error(message.channel, 'Can\'t access the database. Occured attempting to access quotes.');
        db.disconnect();
        return;
      }

      db.disconnect();

      if(quotes.length === 0){
        return await clientMessenger.log(message.channel, 'This user does not have any quotes.\nYou should add some for them.');
      }

      let quoteArray = [];
      for(let i = 0; i < quotes.length; i++){
        quoteArray.push([simpleDate(quotes[i].quote_date), `**${quotes[i].idquote.toString()}** : ${quotes[i].quote_data}`]);
      }

      const settings = {
        title: `${userInfo.username}'s Quotes`,
        description: `There is a total of **${quotes.length}** quotes.`,
        inline: false
      };

      // Add the embed
      await this.client.embedcontroller.sendEmbedPage(message, quoteArray, settings);

    }
    //Nothing.  Get all guild quotes.
    else {

      // Get users from the database.
      let db;
      try {
        db = new DatabaseAdaptar({
            server:   process.env.db_host,
            username: process.env.db_user,
            password: process.env.db_password,
            database: process.env.db
        });
      } catch(err) {
        logger.error(err);
        await clientMessenger.error(message.channel, 'Can\'t access the database.');
        db.disconnect();
        return;
      }

      let quotes;
      try {

        quotes = await db
          .select(['idquote', 'username', 'quote_data', 'quote_date'])
          .where('idguild', message.guild.id)
          .get('user_quotes');

      } catch(err) {
        logger.error(err);
        await clientMessenger.error(message.channel, 'Can\'t access the database. Occured attempting to access quotes.');
        db.disconnect();
        return;
      }

      if(quotes.length === 0){
        return await clientMessenger.log(message.channel, 'This user does not have any quotes.\nYou should add some for them.');
      }

      let quoteArray = [];
      for(let i = 0; i < quotes.length; i++){
        let time = simpleDate(quotes[i].quote_date);
        quoteArray.push([`${quotes[i].username} - ${time}`, `**${quotes[i].idquote}** : ${quotes[i].quote_data}`]);
      }

      const settings = {
        title: `All Quotes`,
        description: `There is a total of **${quotes.length}** quotes.`,
        inline: false
      };

      // Add the embed
      await this.client.embedcontroller.sendEmbedPage(message, quoteArray, settings);
    }
  }
};
