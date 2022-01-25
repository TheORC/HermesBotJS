const AudioPlayer = require('./AudioPlayer');
const Song = require('./song.js');
const logger = require('./Logger.js');
const { isUrl } = require('../utils/function.js');
const YouTube = require("youtube-sr").default;
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

class MusicController {

  constructor(client, settings){
    this.client = client;
    this.settings = settings;
    this.players = {}
  }

  removeAudioPlayer(guildid){
    // Make sure there is something here.
    const audioPlayer = this.getAudioPlayer(guildid);
    if(!audioPlayer)
      return;

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

        const info = await YouTube.getPlaylist(search)
        .then(playlist => playlist.fetch())
        .catch((error) => {
          logger.error(error);
          throw new Error('Song processing error.');
        });

        // Add the playlist to the queue
        for(const video of info.videos){
          // Make sure there is actually something here
          if(video)
            results.push(new Song(`https://www.youtube.com/watch?v=${video.id}`, video.title, video.duration, message.member));

          // Just log the issue
          else
            logger.warn('Had trouble processing a song.');
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

  async ConnectToChannel(message, channel){

    // Remove the audio device if it already exists.
    this.removeAudioPlayer(channel.guild.id);

    // Start the connection
    const connection = joinVoiceChannel({
      channelId: channel.id,
  		guildId: channel.guild.id,
  		adapterCreator: channel.guild.voiceAdapterCreator
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    }catch(error){
      logger.error(error);
      connection.destroy();
      throw error;
    }

    return this.players[channel.guild.id] = new AudioPlayer(this.client, connection);
  }

  async Play(message, search) {

    // Get the audio player for this guild
    let audioPlayer = this.getAudioPlayer(message.guild.id);

    if(!audioPlayer){
      logger.error('No audio player created for bot connection!');
      return await message.channel.send('And error occured connecting the bot.');
    }

    try{
      const songResults = await this.getAudioSources(message, search);

      // Make sure we have songs
      if(songResults.length == 0)
        return message.channel.send(`Oh... That song did not load.  Please try again.`);

      // Only 1 song was added
      if(songResults.length == 1){
        await message.channel.send(`Adding ***${songResults[0].title}*** to the queue.`);
        await audioPlayer.enqueue(songResults[0]);
      }

      // A playlist was added
      else{
        await message.channel.send(`Adding ${songResults.length} songs to the queue.`);
        for(const song of songResults){
          await audioPlayer.enqueue(song);
        }
      }

    }catch(error){
      console.log(error);
      return message.channel.send(`An error occured processing that song.  Please try again.`);
    }
  }

  async PlayNext(message, search) {

    // Get the audio player for this guild
    let audioPlayer = this.getAudioPlayer(message.guild.id);

    if(!audioPlayer){
      logger.error('No audio player created for bot connection!');
      return await message.channel.send('And error occured connecting the bot.');
    }

    try{
      const songResults = await this.getAudioSources(message, search);

      // Make sure we have songs
      if(songResults.length == 0)
        return message.channel.send(`Oh... That song did not load.  Please try again.`);

      // Only 1 song was added
      if(songResults.length == 1){
        await message.channel.send(`Adding ***${songResults[0].title}*** to the start of the queue.`);
        await audioPlayer.enqueueNext(songResults[0]);
      }

      // A playlist was added
      else{
        await message.channel.send(`Adding ${songResults.length} songs to the start of the queue.`);
        for(const song of songResults){
          await audioPlayer.enqueueNext(song);
        }
      }

    }catch(error){
      console.log(error);
      return message.channel.send(`An error occured processing that song.  Please try again.`);
    }
  }

  async AnotherStop(guildid) {
    const audioPlayer = this.getAudioPlayer(guildid);

    if(!audioPlayer)
      return console.log('This should not happen...');

    audioPlayer.voiceConnection.destroy();
    delete this.players[guildid];
  }

  async Stop(message){

    const audioPlayer = this.getAudioPlayer(message.guild.id);

    if(!audioPlayer)
      return message.channel.send('The bot is not playing any music.');

    audioPlayer.voiceConnection.destroy();
    delete this.players[message.guild.id];
    await message.channel.send({ content: `Left channel!`, ephemeral: true });
  }
}

module.exports = MusicController;
