const logger = require("../modules/Logger.js");


module.exports = class {

  constructor(client){
    this.client = client;
  }

  async run(interaction) {

    // Only handle commands
    if (!interaction.isCommand()) { return; }

    // Get the member which issued the command, even if they are offline
    if(interaction.guild && !interaction.member) { await interaction.guild.members.fetch(interaction.author); }

    // Grab the command data from the client.container.slashcmds Collection
    const cmd = this.client.container.slashcmds.get(interaction.commandName);
    if(!cmd) { return; }

    // If everything checks out, run the command
    try {
      await cmd.run(interaction);
      logger.cmd(`${interaction.user.id} ran slash command ${interaction.commandName}`);

    } catch (e) {

      logger.error(e);

      if (interaction.replied) {
        interaction.followUp({ content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``, ephemeral: true })
          .catch(e => console.error("An error occurred following up on an error", e));
      } else {
        if (interaction.deferred){
          interaction.editReply({ content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``, ephemeral: true })
            .catch(e => console.error("An error occurred following up on an error", e));
        } else {
          interaction.reply({ content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\``, ephemeral: true })
            .catch(e => console.error("An error occurred replying on an error", e));
        }
      }
    }
  }

};
