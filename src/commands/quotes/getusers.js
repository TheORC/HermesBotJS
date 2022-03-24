"use strict";

const logger   = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');
const Command  = require('../../base/Command.js');

const { DatabaseAdaptar } = require('../../modules/database.js');
const { HEmbed } = require('../../utils/embedpage.js');

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
          server:   process.env.db_host,
          username: process.env.db_user,
          password: process.env.db_password,
          database: process.env.db
      });

      dbusers = await db.select(['username']).where('idguild', message.guild.id).get('users');
    } catch(err) {

      logger.error(err);
      await clientMessenger.error(message.channel, 'Can\'t access the database. Occured attempting to access users.');

      if(db !== undefined){
        db.disconnect();
      }

      return;
    }

    db.disconnect();

    const reply = dbusers
                  .map((user) => `${user.username}`)
                  .join('\n');
    let embedUsers = new HEmbed({
      title: 'Guild Users',
      description: reply
    });

    await message.channel.send({ embeds: [embedUsers]});
  }
};
