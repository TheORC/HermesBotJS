"use strict";

const logger = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');
const Command = require("../../base/Command.js");

const { AudioPlayerStatus } = require('@discordjs/voice');

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

  async run(message, args){

    // Make sure the member is in a channel.
    let channel;
    if(message.member.voice.channelId === null){
      return await clientMessenger.warn(message.channel, 'This command can only be used from a voice channel.');
    }

    // The user is in a channel.  Get it.
    else{
      channel = message.member.voice.channel;
    }

    // Check to see if this is a resume attempt
    if(args.length === 0) {

      // Make sure the bot is in a channel.
      const audioPlayer = await this.client.musicplayer.getAudioPlayer(message.guild.id);
      if(!audioPlayer){
        return await clientMessenger.log(message.channel, 'The bot is not currently in a channel.');
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

    // Connect the bot and play a song.
    else {
      // The music bot is not in a channel
      let botVoiceChannel;
      if(message.guild.me.voice){
        botVoiceChannel = message.guild.me.voice.channel;
      }

      // Check if the bot is in a channel
      if(!botVoiceChannel || botVoiceChannel.id !== channel.id){

        // The bot is either not conencted or in another channel.
        logger.log('Connecting music bot');
        await this.client.musicplayer.ConnectToChannel(message, channel);
      }

      // Get the audio player
      const audioPlayer = this.client.musicplayer.getAudioPlayer(message.channel.guild.id);
      if(!audioPlayer){

        // This is true when the server restarts and the bot has not yet left the channel.
        logger.warn('Attempting to connect bot in rare case.');
        await this.client.musicplayer.ConnectToChannel(message, channel);
      }

      // We are in a voice channel
      await this.client.musicplayer.Play(message, args.join(' '));
    }
  }
};
