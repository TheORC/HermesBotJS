"use strict";

const logger   = require('../../modules/Logger.js');
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
      return await message.channel.send('Wrong syntax.  Check help for additional information.');
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
        db.disconnect();
        return await message.send('There was a problem talking with the database.');
      }

      // Extract user information
      const userInfo = getDatabaseCotainsUser(dbusers, userName);

      // Check
      if(!userInfo){
        return await message.channel.send('User not found.  Please check your spelling or add them.');
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
        db.disconnect();
        return await message.channel.send('Unable to get quotes.');
      }

      db.disconnect();

      if(quotes.length === 0){
        return await message.channel.send('There are no quotes for this user.');
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
      await this.client.embedcontroller.addPage(message, quoteArray, settings);

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
        db.disconnect();
        return await message.channel.send('There was a problem talking with the database.');
      }

      let quotes;
      try {

        quotes = await db
          .select(['idquote', 'username', 'quote_data', 'quote_date'])
          .where('idguild', message.guild.id)
          .get('user_quotes');

      } catch(err) {
        logger.error(err);
        db.disconnect();
        return await message.channel.send('Unable to get quotes.');
      }

      if(quotes.length === 0){
        return await message.channel.send('There are no quotes.');
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
      await this.client.embedcontroller.addPage(message, quoteArray, settings);
    }
  }
};
