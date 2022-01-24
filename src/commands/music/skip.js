const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

module.exports = class SkipMusic extends Command {

  constructor(client){
    super(client, {
      name: "skip",
      description: "Skips the current song.",
      category: "Music Player",
      usage: "skip",
      aliases: [],
      enabled = false
    });

    this.client = client;
  }

  async run(message, args, level){

    const channel = message.member.voice?.channel;

    if(!channel)
      return message.channel.send('This command can only be used when in a voice channel.');

    const audioPlayer = this.client.musicplayer.getAudioPlayer(message.channel.guild.id);
    if(!audioPlayer)
      return await message.channel.send('The bot is not in a voice channel.');

    // We are in a voice channel, pause the song
    await audioPlayer.skip();
    await message.channel.send('The song has been skiped.');
  }
}
