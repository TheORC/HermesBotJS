"use strict";

const Command = require('../../base/Command.js');

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

    if(audioPlayer.getQueue().length === 0){
      return await message.channel.send('The queue is already empty.');
    }

    audioPlayer.clearQueue();
    await message.channel.send('The queue has been cleared.');
  }
};
