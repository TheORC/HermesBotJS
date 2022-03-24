"use strict";

const Command = require("../../base/Command.js");
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class StopMusic extends Command {

  constructor(client){
    super(client, {
      name: "stop",
      description: "Make the music bot stop.",
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

    // We are in a voice channel, pause the song
    await this.client.musicplayer.Stop(message);
  }
};
