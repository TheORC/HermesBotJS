"use strict";

const AudioPlayer = require('./AudioPlayer');
const Song = require('./song.js');
const logger = require('./Logger.js');
const clientMessenger = require('./clientmessenger.js');
const { HEmbed } = require('../utils/embedpage.js');
const { isUrl } = require('../utils/function.js');
const YouTube = require("youtube-sr").default;
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

class MusicController {

  constructor(client, settings){
    this.client = client;
    this.settings = settings;
    this.players = {};
  }

  removeAudioPlayer(guildid){
    // Make sure there is something here.
    const audioPlayer = this.getAudioPlayer(guildid);
    if(!audioPlayer){
      return;
    }

    audioPlayer.voiceConnection.destroy();
    delete this.players[guildid];
  }

  // Function for getting an audio player
  getAudioPlayer(guildid){
    return this.players[guildid];
  }

  async getAudioSources(message, search) {

    // The output will be a list of songs.
    let results = [];

    // Check if a url was provided
    if(isUrl(search)){

      // This is a playlist
      if(search.includes('list=P')){

        // TODO: Fix an issue where a null playlist is added to the audio queue.
        const info = await YouTube.getPlaylist(search)
        .then(playlist => playlist.fetch())
        .catch((error) => {
          logger.error(error);
          throw new Error('Song processing error.');
        });

        // Add the playlist to the queue
        for(const video of info.videos) {
          // Make sure there is actually something here
          if(video) {
            results.push(new Song(`https://www.youtube.com/watch?v=${video.id}`, video.title, video.duration, message.member));
          }

          // Just log the issue
          else{
            logger.warn('Had trouble processing a song.');
          }
        }
      }

      // Just a url
      else {

        // Retreive information about the requested song.
        const info = await YouTube.getVideo(search)
        .catch(error => {
          logger.error(error);
          throw new Error('Song processing error.');
        });

        // Make sure a video result is returned.
        if(info) {
          results.push(new Song(`https://www.youtube.com/watch?v=${info.id}`, info.title, info.duration, message.member));
        } else {
          // There was an issue processing this song.
          logger.warn('Had trouble processing a song');
        }
      }
    }

    // This is a search string
    else {

      // Retreive the song search
      const info = await YouTube.searchOne(search)
      .catch(error => {
        logger.error(error);
        throw new Error('Song processing error.');
      });

      // Make sure a video result is returned.
      if(info){
        results.push(new Song(`https://www.youtube.com/watch?v=${info.id}`, info.title, info.duration, message.member));
      }else{
        logger.warn('Had trouble processing a song');
      }
    }

    // Return the list of songs.
    return results;
  }

  async ConnectToChannel(channel) {

    // Remove the audio device if it already exists.
    this.removeAudioPlayer(channel.guild.id);

    // Start the connection
    const connection = joinVoiceChannel({
      channelId: channel.id,
  		guildId: channel.guild.id,
  		adapterCreator: channel.guild.voiceAdapterCreator
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30000);
    }catch(error){
      logger.error(error);
      connection.destroy();
      throw error;
    }

    this.players[channel.guild.id] = new AudioPlayer(this.client, connection);
    return this.players[channel.guild.id];
  }

  async Play(message, search) {

    let channel, isInteraction;
    if(message.type && message.type === 'APPLICATION_COMMAND') {
      isInteraction = true;
      channel = message;
    }else{
      isInteraction = false;
      channel = message.channel;
    }

    // Get the audio player for this guild
    let audioPlayer = this.getAudioPlayer(message.guild.id);

    if(!audioPlayer){
      logger.error('No audio player created for bot connection!');
      return await clientMessenger.error(channel, 'And error occured connecting the bot.');
    }

    try {
      const songResults = await this.getAudioSources(message, search);

      // Make sure we have songs
      if(songResults.length === 0){
        return await clientMessenger.error(channel, `Oh... That song did not load.  Please try again.`);
      }

      // Only 1 song was added
      if(songResults.length === 1) {

        // Alert the user
        const newSongEmbed = new HEmbed({
          title: 'Adding Song',
          description: `[${songResults[0].title}](${songResults[0].url})`
        });

        if(isInteraction){
          await channel.editReply({embeds: [newSongEmbed]});
        } else {
          await channel.send({embeds: [newSongEmbed]});
        }


        // Add song to queue
        await audioPlayer.enqueue(songResults[0]);
      }

      // A playlist was added
      else {
        const newPlaylistEmbed = new HEmbed({
          title: 'Adding Playlist',
          description: `${songResults.length} song(s) added to queue.`
        });

        if(isInteraction){
          await channel.editReply({embeds: [newPlaylistEmbed]});
        }else{
          await channel.send({embeds: [newPlaylistEmbed]});
        }


        for(const song of songResults) {
          await audioPlayer.enqueue(song);
        }
      }

    } catch(error) {
      logger.error(error);
      return await clientMessenger.error(channel, `An error occured processing that song.  Please try again.`);
    }
  }

  async PlayNext(message, search) {

    let channel, isInteraction;
    if(message.type && message.type === 'APPLICATION_COMMAND') {
      isInteraction = true;
      channel = message;
    }else{
      isInteraction = false;
      channel = message.channel;
    }

    // Get the audio player for this guild
    let audioPlayer = this.getAudioPlayer(message.guild.id);

    if(!audioPlayer){
      logger.error('No audio player created for bot connection!');
      return await clientMessenger.error(channel, 'And error occured connecting the bot.');
    }

    try{
      const songResults = await this.getAudioSources(message, search);

      // Make sure we have songs
      if(songResults.length === 0){
        return await clientMessenger.error(channel, `Oh... That song did not load.  Please try again.`);
      }

      // Only 1 song was added
      if(songResults.length === 1){

        //Alert the user
        const newSongEmbed = new HEmbed({
          title: 'Adding Song',
          description: `[${songResults[0].title}](${songResults[0].url})`
        });

        if(isInteraction){
          await channel.editReply({ embeds: [newSongEmbed] });
        }else{
          await channel.send({ embeds: [newSongEmbed] });
        }

        // Add the song
        await audioPlayer.enqueueNext(songResults[0]);
      }

      // A playlist was added
      else {

        const newPlaylistEmbed = new HEmbed({
          title: 'Adding Playlist',
          description: `${songResults.length} song(s) added to queue.`
        });

        if(isInteraction){
          await channel.editReply({ embeds: [newPlaylistEmbed] });
        }else{
          await message.channel.send({embeds: [newPlaylistEmbed]});
        }

        for(const song of songResults){
          await audioPlayer.enqueueNext(song);
        }
      }

    }catch(error){
      logger.error(error);
      return await clientMessenger.error(channel, `An error occured processing that song.  Please try again.`);
    }
  }

  async AnotherStop(guildid) {
    const audioPlayer = this.getAudioPlayer(guildid);

    if(!audioPlayer){
      return logger.error('This should not happen...');
    }

    audioPlayer.voiceConnection.destroy();
    delete this.players[guildid];
  }

  async Stop(message){

    let channel;
    if(message.type && message.type === 'APPLICATION_COMMAND') {
      channel = message;
    }else{
      channel = message.channel;
    }

    const audioPlayer = this.getAudioPlayer(message.guild.id);

    if(!audioPlayer){
      logger.error('No audio player found.');
      return await clientMessenger.error(channel, 'The music bot is not in a channel.');
    }

    audioPlayer.voiceConnection.destroy();
    delete this.players[message.guild.id];
    await clientMessenger.log(channel, 'Left channel!');
  }
}

module.exports = MusicController;
