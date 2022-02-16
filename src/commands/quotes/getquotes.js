"use strict";

const logger   = require('../../modules/Logger.js');
const Command  = require('../../base/Command.js');

const { MessageEmbed } = require('discord.js');
const { DatabaseAdaptar } = require('../../modules/database.js');
const { getDatabaseCotainsUser } = require('../../utils/function.js');

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
        db = new DatabaseAdaptar({server: 'localhost', username: 'root', password: 'Letmein21', database: 'hermes'});
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

      if(quotes.length === 0){
        return await message.channel.send('There are no quotes for this user.');
      }

      const embed = new MessageEmbed();
      for(let i = 0; i < quotes.length; i++){
        embed.addField('Quote', quotes[i].quote_data, false);
      }
      await message.channel.send({ embeds: [embed] });

    }
    //Nothing.  Get all guild quotes.
    else {
      //// TODO:
      console.log('TODO');
    }

  }
};
