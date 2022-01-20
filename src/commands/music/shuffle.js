const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

module.exports = class ShuffleMusic extends Command {

  constructor(client){
    super(client, {
      name: "shuffle",
      description: "Shuffle the songs in the queue.",
      category: "Music Player",
      usage: "shuffle",
      aliases: ['sh']
    });

    this.client = client;
  }

  async run(message, args, level){

    const channel = message.member?.voice.channel;

    if(!channel)
      return message.channel.send('This command can only be used when in a voice channel.');

    // We are in a voice channel, pause the song
    await this.client.musicplayer.Shuffle(message);
  }
}
