const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

module.exports = class StopMusic extends Command {

  constructor(client){
    super(client, {
      name: "stop",
      description: "Make the music bot stop.",
      category: "Music Player",
      usage: "resume",
      aliases: []
    });

    this.client = client;
  }

  async run(message, args, level){

    // Make sure the member is in a channel.
    const channel = message.member.voice?.channel;
    if(!channel)
      return message.channel.send('This command can only be used when in a voice channel.');

    // Make sure the bot is in a channel.
    const audioPlayer = await this.client.musicplayer.getAudioPlayer(message.guild.id);
    if(!audioPlayer)
      return await message.channel.send('The bot is not currently in a channel.');

    // We are in a voice channel, pause the song
    await this.client.musicplayer.Stop(message);
  }
}
