"use strict";

const Command = require('../../base/Command.js');

module.exports = class LoopMusic extends Command {

  constructor(client){
    super(client, {
      name: "loop",
      description: "Loops the current song or playlist.",
      category: "Music Player",
      usage: "loop [song, playlist, none]",
      aliases: ['loo', 'lo']
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

    const command = args[0];

    switch (command) {
      case 'song':
        audioPlayer.setLoopSong();
        await message.channel.send('Enabled song loop.');
        break;
      case 'playlist':
        if(audioPlayer.getQueue().length === 0){
          return await message.channel.send('There needs to be at least 1 song in the queue to loop the playlist.');
        }

        audioPlayer.setLoopPlaylist();
        await message.channel.send('Enable playlist loop');
        break;
      case 'none':
        audioPlayer.disableLoop();
        await message.channel.send('Disabled song looping.');
        break;
      default:
        return await message.channel.send('Unknown loop option, please use either song, playlist, or none.');
    }
  }
};
