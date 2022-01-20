const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

module.exports = class PauseMusic extends Command {

  constructor(client){
    super(client, {
      name: "pause",
      description: "Pause the current song playing.",
      category: "Music Player",
      usage: "pause",
      aliases: []
    });

    this.client = client;
  }

  async run(message, args, level){

    const channel = message.member?.voice.channel;

    if(!channel)
      return message.channel.send('This command can only be used when in a voice channel.');

    // We are in a voice channel, pause the song
    await this.client.musicplayer.Pause(message);
  }

}
