const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

module.exports = class PlayMusic extends Command {

  constructor(client){
    super(client, {
      name: "play",
      description: "Plays a song in your channel.",
      category: "Music Player",
      usage: "play [song name or url]",
      aliases: ["p", "pl"]
    });
    this.client = client;
  }

  async run(message, args, level){
    // We are in a voice channel
    await this.client.musicplayer.Play(message, args.join(' '));
  }
};
