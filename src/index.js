"use strict";

// Import required packages
const { log, warn, error } = require('./modules/Logger.js');
const fs = require('fs');
const { asyncSubFileSearch } = require('./utils/function.js');

// Check for the correct version of node
if (Number(process.version.slice(1).split(".")[0]) < 16){
  return error('Node 16.x or higher is required. Update Node on your system.');
}

require("dotenv").config();

// Import Discord objects
const { Client, Collection } = require('discord.js');

// Import bot settings
const { intents, partials } = require('./config.js');

// Import Music Client
const MusicController = require('./modules/MusicController.js');
const EmbedController = require('./modules/embedcontroller.js');

class HermesBot extends Client {
  constructor(options) {
    super(options);

    this.container = {
      commands: new Collection(),
      aliases: new Collection(),
      slashcmds: new Collection()
    };

    this.musicplayer = new MusicController(this, {});
    this.embedcontroller = new EmbedController(this);
  }
}

const client = new HermesBot({intents, partials});

const init = async () => {

  // Load commands
  const commands = await asyncSubFileSearch('./src/commands/', 'commands');
  for(const file of commands){
    // Require the file into memory.
    const props = new (require(`./commands${file}`))(client);
    // Add the details into the commands collection.
    client.container.commands.set(props.help.name, props);
    // Loop and add every alias into the aliases collection.
    props.conf.aliases.forEach(alias => {
      client.container.aliases.set(alias, props.help.name);
    });
    // Output to the console.
    log(`Loading Command: ${props.help.name}.`);
  }

  // Load any slash commands
  const slashCommands = fs.readdirSync('./src/slash/').filter(() => fs.endsWith('.js'));

  for (const file of slashCommands){
    const command = new (require(`./slash/${file}`))(client);
    const commandName = file.split(".")[0];
    // Now set the name of the command with it's properties.
    client.container.slashcmds.set(command.commandData.name, command);
    log(`Loading Slash command: ${commandName}.`);
  }

  // Load any events
  const eventFiles = fs.readdirSync('./src/events/').filter(f => f.endsWith('.js'));
  for (const file of eventFiles){
    const eventName = file.split(".")[0];
    const event = new (require(`./events/${file}`))(client);
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, (...args) => event.run(...args));
    delete require.cache[require.resolve(`./events/${file}`)];
    log(`Loading Event: ${eventName}.`);
  }

  log('Finished Loading Modules. Starting Client...');

  // Join the active thread
  client.on('threadCreate', (thread) => thread.join());


  // Start the client
  client.login(process.env.token);

  log('Client has started.');
};

init();

client.on('disconnect', () => warn('Bot is disconnecting...'))
  .on('reconnecting', () => log('Bot is reconnecting...'))
  .on('error', e => error(e))
  .on('warn', info => warn(info));

// These 2 process methods will catch exceptions and give *more details* about the error and stack trace.
process.on("uncaughtException", (err) => {
  const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
  console.error("Uncaught Exception: ", errorMsg);
  // Always best practice to let the code crash on uncaught exceptions.
  // Because you should be catching them anyway.
  process.exit(1);
});

process.on("unhandledRejection", err => {
  console.error("Uncaught Promise Error: ", err);
});
