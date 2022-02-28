"use strict";

const Command = require('../../base/Command.js');
const progressBar = require('../../utils/progressbar.js');
const clientMessenger = require('../../modules/clientmessenger.js');
const { HEmbed } = require('../../utils/embedpage.js');

const { AudioPlayerStatus } = require('@discordjs/voice');


module.exports = class NowMusic extends Command {

  constructor(client){

    super(client, {
      name: "now",
      description: "Shows the current song being played.",
      category: "Music Player",
      usage: "now",
      aliases: ['nowplaying', 'np']
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

    if(audioPlayer.getStatus() !== AudioPlayerStatus.Playing){
      return await clientMessenger.log(message.channel, 'The bot is not playing anything.');
    }

    const currentSong = audioPlayer.getCurrentSong();
    if(!currentSong){
      return await clientMessenger.log(message.channel, 'The music bot is not playing anything.');
    }

    const songDuration = currentSong.duration;
    const playedDuration = audioPlayer.currentResorce.playbackDuration;

    const nowEmbed = new HEmbed({
      title: '',
      description: '',
      inline: false
    });
    nowEmbed.addFields(
      {name:'**Now Playing**', value: `[${currentSong.title}](${currentSong.url})` },
      {name:`Played Duration`, value: `${progressBar(playedDuration, songDuration, 20)}`},
      {name: 'Requested By', value: `${currentSong.requester}`},
    );

    await message.channel.send({embeds: [nowEmbed]});
  }
};
