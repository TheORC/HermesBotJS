"use strict";

const Command = require("../base/Command.js");
const clientMessenger = require('../modules/clientmessenger.js');
const { codeBlock } = require("@discordjs/builders");

/*
  The HELP command is used to display every command's name and description
  to the user, so that he may see what commands are available. The help
  command is also filtered by level, so if a user does not have access to
  a command, it is not shown to them. If a command name is given with the
  help command, its extended help is shown.
*/
module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "Displays all the available commands for you.",
      category: "System",
      usage: "help [command]",
      aliases: ["h", "halp"]
    });
  }

  async run(message, args) {
    const { container } = this.client;
    // If no specific command is called, show all filtered commands.
    if (!args[0]) {
      // Load guild settings (for prefixes and eventually per-guild tweaks)
      const settings = message.settings;

      // Filter all commands by which are available for the user's level, using the <Collection>.filter() method.
      const myCommands = container.commands;

      // Then we will filter the myCommands collection again to get the enabled commands.
      const enabledCommands = myCommands.filter(cmd => cmd.conf.enabled);

      // Here we have to get the command names only, and we use that array to get the longest name.
      const commandNames = [...enabledCommands.keys()];

      // This make the help commands "aligned" in the output.
      const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

      let currentCategory = "";
      let output = `= Command List =\n[Use ${settings.prefix}help <commandname> for details]\n`;
      const sorted = enabledCommands.sort((p, c) => p.help.category > c.help.category ? 1 :
        p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1 );

      sorted.forEach( c => {
        const cat = c.help.category;
        if (currentCategory !== cat) {
          output += `\u200b\n== ${cat} ==\n`;
          currentCategory = cat;
        }
        output += `${settings.prefix}${c.help.name}${" ".repeat(longest - c.help.name.length)} :: ${c.help.description}\n`;
      });
      await message.channel.send(codeBlock("asciidoc", output));

    } else {
      // Show individual command's help.
      let command = args[0];
      if (container.commands.has(command) || container.commands.has(container.aliases.get(command))) {

        if(container.commands.get(command)){
           command =  container.commands.get(command);
        } else {
          command = container.commands.get(container.aliases.get(command));
        }

        await message.channel.send(codeBlock("asciidoc", `= ${command.help.name} = \n${command.help.description}\nusage:: ${command.help.usage}\nalises:: ${command.conf.aliases.join(", ")}`));
      } else {

        return await clientMessenger.warn(message.channel, "No command with that name, or alias exists.");
      }
    }
  }
};
