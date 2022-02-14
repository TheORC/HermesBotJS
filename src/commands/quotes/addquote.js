const logger   = require('../../modules/Logger.js');
const Command  = require('../../base/Command.js');

const { DatabaseAdaptar } = require('../../modules/database.js');
const { currentDateToString, getDatabaseCotainsUser } = require('../../utils/function.js');

module.exports = class AddQuote extends Command {

  constructor(client) {
    super(client, {
      name: "addquote",
      description: "Adds a new quote.",
      category: "Quotes",
      usage: "addquote [username] [quote]",
      aliases: ["aq"]
    });

    this.client = client;
  }

  async run(message, args, level) {


    // ['word', 'wordtwo']

    // Create a database connections
    let database;

    try {
       database = new DatabaseAdaptar({
        server: 'localhost',
        username: 'root',
        password: 'Letmein21',
        database: 'hermes'
      });
    } catch(err) {
      console.log(err);
      database.disconnect();
      return await message.channel.send('There was an error talking to the database.');
    }

    let dbusers;
    try {

      // Get the users with quotes in this guild
      dbusers = await database.select(['iduser', 'username']).where('idguild', message.guild.id).get('users');

    } catch (err) {
      console.log(err);
      database.disconnect();
      return await message.channel.send('There was an error talking to the database.');
    }

    // Check the command syntax
    if(args.length <= 1){
      return await message.channel.send('Command syntax wrong.  Please refer to help.')
    }

    // Get the command information
    const userName = args[0];
    const quote = args.join(' ').split(userName)[1].trim();

    // Get the db user
    const userInfo = getDatabaseCotainsUser(dbusers, userName);

    if(!userInfo)
      return await message.channel.send('User not found.  Please check your spelling or add them.');

    try {
      let info = await database.insert('quotes', {
        iduser: userInfo.iduser,
        idguild: message.guild.id,
        quote_data: quote,
        quote_date: currentDateToString()
      });

      await message.channel.send('Added a new quote with the id: ' + info.insertId);
    } catch(err) {
      console.log(err);
      database.disconnect();
      return await message.channel.send('There was an error talking to the database.');
    }

    // Make sure we clean up after ourselves.
    database.disconnect();
  }
};
