"use strict";

const Command = require('../../base/Command.js');
const progressBar = require('../../utils/progressbar.js');

const { AudioPlayerStatus } = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');

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

    if(audioPlayer.getStatus() !== AudioPlayerStatus.Playing){
      return await message.channel.send('The bot is not currently playing anything.');
    }

    const currentSong = audioPlayer.getCurrentSong();
    if(!currentSong){
      return await message.channel.send('There is no current song in the audio player.');
    }

    const songDuration = currentSong.duration;
    const playedDuration = audioPlayer.currentResorce.playbackDuration;

    const nowEmbed = new MessageEmbed()
    .setColor('#1F8B4C')
    .addFields(
      {name:'**Now Playing**', value: `[${currentSong.title}](${currentSong.url})` },
      {name:`Played Duration`, value: `${progressBar(playedDuration, songDuration, 20)}`},
      {name: 'Requested By', value: `${currentSong.requester}`},
    );

    await message.channel.send({embeds: [nowEmbed]});
  }
};
