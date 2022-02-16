"use strict";

const { isNumeric } = require('../../utils/function.js');
const Command = require("../../base/Command.js");

module.exports = class VolumeMusic extends Command {

  constructor(client){
    super(client, {
      name: "volume",
      description: "Changes the volume of the bot.",
      category: "Music Player",
      usage: "volume [value between 0-100]",
      aliases: ["vo"]
    });

    this.client = client;
  }

  async run(message, args){

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

    const volume = args[0];
    if(!isNumeric(volume) || !volume){
      return await message.channel.send('Make sure you enter a number (1-100).');
    }

    const volumeNumber = parseInt(volume);
    if(volumeNumber <= 0 || volumeNumber > 100){
      return await message.channel.send('Make sure the volume is between 1 and 100.');
    }

    audioPlayer.setVolume(volumeNumber/100);
    await message.channel.send(`The volume has been changed to ${volumeNumber}%`);
  }
};
