"use strict";

const Command = require("../../base/Command.js");
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class ShuffleMusic extends Command {

  constructor(client){
    super(client, {
      name: "shuffle",
      description: "Shuffle the songs in the queue.",
      category: "Music Player",
      usage: "shuffle",
      aliases: ['sh']
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
      return await clientMessenger.log(message.channel, 'The music queue is empty.');
    }

    // We are in a voice channel, pause the song
    await audioPlayer.shuffleQueue();
    await clientMessenger.log(message.channel, 'The music queue has been shuffled.');
  }
};
