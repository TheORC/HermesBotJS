const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

module.exports = class QueueMusic extends Command {

  constructor(client){

    super(client, {
      name: "queue",
      description: "Shows the music queue.",
      category: "Music Player",
      usage: "queue",
      aliases: ["q"]
    });

    this.client = client;
  }

  async run(message, args, level){

    const channel = message.member?.voice.channel;

    if(!channel)
      return message.channel.send('This command can only be used when in a voice channel.');

    // We are in a voice channel
    await this.client.musicplayer.Queue(message);
  }
};
