"use strict";

const logger   = require('../../modules/Logger.js');
const Command  = require('../../base/Command.js');

const { DatabaseAdaptar } = require('../../modules/database.js');
const { MessageEmbed } = require('discord.js');

module.exports = class GetQuotes extends Command {

  constructor(client) {
    super(client, {
      name: "getusers",
      description: "Retrieves all users in the guild.",
      category: "Quotes",
      usage: "getusers",
      aliases: ["gu"]
    });
  }

  async run(message) {

    // Get users from the database.
    let db, dbusers;
    try {

      db = new DatabaseAdaptar({
          server: 'localhost',
          username: process.env.db_user,
          password: process.env.db_password,
          database: process.env.db
      });

      dbusers = await db.select(['username']).where('idguild', message.guild.id).get('users');
    } catch(err) {
      if(db !== undefined){
        db.disconnect();
      }
      logger.error(err);
      return await message.send('There was a problem talking with the database.');
    }

    db.disconnect();

    let embed = new MessageEmbed();
    embed.setTitle('Guild Users');
    embed.setColor('0x1f8b4c');

    for(let i = 0; i < dbusers.length; i++) {
      embed.addField('\u200b', `> ${dbusers[i].username}`);
    }

    await message.channel.send({embeds: [embed]});
  }
};
