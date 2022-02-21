"use strict";


const { Intents } = require("discord.js");

const config = {
  // Bot Admins, level 9 by default. Array of user ID strings.
  "admins": [],

  // Bot Support, level 8 by default. Array of user ID strings
  "support": [],

  // Intents the bot needs.
  // By default GuideBot needs Guilds, Guild Messages and Direct Messages to work.
  // For join messages to work you need Guild Members, which is privileged and requires extra setup.
  // For more info about intents see the README.
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  // Partials your bot may need should go here, CHANNEL is required for DM's
  partials: ["CHANNEL"],

  // Default per-server settings. These settings are entered in a database on first load,
  // And are then completely ignored from this file. To modify default settings, use the `conf` command.
  // DO NOT REMOVE THIS BEFORE YOUR BOT IS LOADED AND FUNCTIONAL.

  "defaultSettings" : {
    "prefix": "!",
    "modLogChannel": "mod-log",
    "modRole": "Moderator",
    "adminRole": "Administrator",
    "systemNotice": "true", // This gives a notice when a user tries to run a command that they do not have permission to use.
    "commandReply": "true", // Toggle this if you want the bot to ping the executioner or not.
    "welcomeChannel": "welcome",
    "welcomeMessage": "Say hello to {{user}}, everyone! We all need a warm welcome sometimes :D",
    "welcomeEnabled": "false"
  }

};

module.exports = config;
