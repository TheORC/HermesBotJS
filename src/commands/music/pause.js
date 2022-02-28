"use strict";

const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");
const clientMessenger = require('../../modules/clientmessenger.js');

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

    if(audioPlayer.getStatus() !== AudioPlayerStatus.Playing){
      return await clientMessenger.log(message.channel, 'The music bot is not playing anything.');
    }

    // Ok, lets pause the player
    await audioPlayer.pause();
    await clientMessenger.log(message.channel, 'The music bot is paused.');
    logger.log('Music bot has been paused.');
  }
};
