"use strict";

const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = class ResumeMusic extends Command {

  constructor(client){
    super(client, {
      name: "resume",
      description: "Resumes the playing of a song.",
      category: "Music Player",
      usage: "resume",
      aliases: []
    });

    this.client = client;
  }

  async run(message){

    // Make sure the member is in a channel.
    let channel;
    if(message.member.voice){
      channel = message.member.voice.channel;
    } else {
      return message.channel.send('This command can only be used when in a voice channel.');
    }

    // Make sure the bot is in a channel.
    const audioPlayer = await this.client.musicplayer.getAudioPlayer(message.guild.id);
    if(!audioPlayer){
      return await message.channel.send('The bot is not currently in a channel.');
    }

    // Make sure the bot is playing a song.
    if(audioPlayer.getStatus() !== AudioPlayerStatus.Paused){
      return await message.channel.send('The bot is not currently paused.');
    }

    // We are in a voice channel, resume the song.
    await audioPlayer.resume();
    await message.channel.send('The music bot has been resumed.');
    logger.log('Music bot has been resumed.');
  }
};
