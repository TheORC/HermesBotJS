"use strict";

const { isNumeric } = require('../../utils/function.js');
const clientMessenger = require('../../modules/clientmessenger.js');
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

    // Check the command syntax
    if(args.length !== 1){
      return await clientMessenger.warn(message.channel, 'Wrong syntax.  Check help for additional information.');
    }

    // Check the args validity
    const volume = args[0];
    if(!isNumeric(volume) || !volume){
      return await clientMessenger.warn(message.channel, 'Make sure you enter a number (1-100).');
    }

    // Check volume bounds.
    const volumeNumber = parseInt(volume);
    if(volumeNumber <= 0 || volumeNumber > 100){
      return await clientMessenger.warn(message.channel, 'Make sure the volume is between 1 and 100.');
    }

    // Make sure the member is in a channel.
    if(message.member.voice.channelId === null){
      return await clientMessenger.warn(message.channel, 'This command can only be used from a voice channel.');
    }

    // Make sure the bot is in a channel.
    const audioPlayer = await this.client.musicplayer.getAudioPlayer(message.guild.id);
    if(!audioPlayer){
      return await clientMessenger.log(message.channel, 'The music bot is not playing anything.');
    }

    audioPlayer.setVolume(volumeNumber/100);
    await clientMessenger.log(message.channel, `The volume has been changed to ${volumeNumber}%.`);
  }
};
