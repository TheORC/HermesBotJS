"use strict";

const logger = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');
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
    if(message.member.voice.channelId === null){
      return await clientMessenger.warn(message.channel, 'This command can only be used from a voice channel.');
    }

    // Make sure the bot is in a channel.
    const audioPlayer = await this.client.musicplayer.getAudioPlayer(message.guild.id);
    if(!audioPlayer){
      return await clientMessenger.log(message.channel, 'The music bot is not playing anything.');
    }

    // Make sure the bot is playing a song.
    if(audioPlayer.getStatus() !== AudioPlayerStatus.Paused){
      return await clientMessenger.log(message.channel, 'The bot is already playing.');
    }

    // We are in a voice channel, resume the song.
    await audioPlayer.resume();
    await clientMessenger.log(message.channel, 'The bot has been resumed.');
    logger.log('Music bot has been resumed.');
  }
};
