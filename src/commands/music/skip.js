"use strict";

const Command = require("../../base/Command.js");
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class SkipMusic extends Command {

  constructor(client){
    super(client, {
      name: "skip",
      description: "Skips the current song.",
      category: "Music Player",
      usage: "skip",
      aliases: ['ss', 'fs']
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

    // We are in a voice channel, pause the song
    await audioPlayer.skip();
    await clientMessenger.log(message.channel, 'The song has been skiped.');
  }
};
