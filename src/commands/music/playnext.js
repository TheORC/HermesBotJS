"use strict";

const logger = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');
const Command = require("../../base/Command.js");

module.exports = class PlayNextMusic extends Command {

  constructor(client){
    super(client, {
      name: "playnext",
      description: "Plays a song next in your channel.",
      category: "Music Player",
      usage: "playnext [song name or url]",
      aliases: ["pn"]
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
    await this.client.musicplayer.PlayNext(message, args.join(' '));
  }
};
