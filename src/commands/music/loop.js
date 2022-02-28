"use strict";

const Command = require('../../base/Command.js');
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class LoopMusic extends Command {

  constructor(client){
    super(client, {
      name: "loop",
      description: "Loops the current song or playlist.",
      category: "Music Player",
      usage: "loop [song, queue, stop]",
      aliases: ['loo', 'lo']
    });

    this.client = client;
  }

  async run(message, args){

    // Check the command syntax
    if(args.length !== 1){
      return await clientMessenger.warn(message.channel, 'Wrong syntax.  Check help for additional information.');
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

    const command = args[0];
    switch (command) {
      case 'song':
        audioPlayer.setLoopSong();
        await clientMessenger.log(message.channel, 'The current song will be looped.');
        break;
      case 'queue':

        // Check for at least 1 song in the queue
        if(audioPlayer.getQueue().length === 0){
          return await clientMessenger.warn(message.channel, 'There needs to be at least 1 song in the queue to loop the queue.');
        }

        audioPlayer.setLoopPlaylist();
        await clientMessenger.log(message.channel, 'The queue will be looped.');
        break;
      case 'stop':
        audioPlayer.disableLoop();
        await clientMessenger.log(message.channel, 'Looping has been disabled.');
        break;
      default:
        return await clientMessenger.warn(message.channel, 'Unknown loop option, please use either song, queue, or stop.');
    }
  }
};
