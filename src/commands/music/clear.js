"use strict";

const Command = require('../../base/Command.js');
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class ClearMusic extends Command {

  constructor(client){
    super(client, {
      name: "clear",
      description: "Clears the music queue.",
      category: "Music Player",
      usage: "clear",
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

    if(audioPlayer.getQueue().length === 0){
      return await clientMessenger.log(message.channel, 'The queue is empty.');
    }

    audioPlayer.clearQueue();
    await clientMessenger.log(message.channel, 'The music queue has been cleared.');
  }
};
