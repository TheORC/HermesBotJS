const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

const { AudioPlayerStatus } = require('@discordjs/voice');

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

    const channel = message.member.voice?.channel;

    // Make sure the member is in a channel.
    if(!channel)
      return message.channel.send('This command can only be used when in a voice channel.');

    // Make sure the bot is in a channel.
    const audioPlayer = await this.client.musicplayer.getAudioPlayer(message.guild.id);
    if(!audioPlayer)
      return await message.channel.send('The bot is not currently in a channel.');

    // Make sure the bot is playing a song.
    if(audioPlayer.getStatus() !== AudioPlayerStatus.Playing)
      return await message.channel.send('The bot is not currently playing a song.');

    // Ok, lets pause the player
    await audioPlayer.pause();
    await message.channel.send('The music has been paused.');
    logger.log('Music bot has been paused.');
  }
}
