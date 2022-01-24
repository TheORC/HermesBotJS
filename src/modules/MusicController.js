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

    // Check if a url was provided
    if(isUrl(search)){

      // This is a playlist
      if(search.includes('list=P')){

        // Get the music playlist
        const info = await YouTube.getPlaylist(search)
        .then(playlist => playlist.fetch())
        .catch((error) => {
          logger.error(error);
          return message.channel.send(`An error occured processing that song.  Please try again.`);
        });

        // Alert the guild of the playlist being added
        await message.channel.send(`Adding ${info.videoCount} songs to the queue.`);

        // Add the playlist to the queue
        for(const video of info.videos){
          if(video){
            const song = new Song(`https://www.youtube.com/watch?v=${video.id}`, video.title);
            await audioPlayer.enqueue(song);
          }else{
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
          return message.channel.send(`An error occured processing that song.  Please try again.`);
        });

        logger.log(`info: ${info}`);

        // Make sure a video result is returned.
        if(info){
          await message.channel.send(`Adding ***${info.title}*** to the queue.`);
          const song = new Song(`https://www.youtube.com/watch?v=${info.id}`, info.title);
          await audioPlayer.enqueue(song);
        }else{
          logger.warn('Had trouble processing a song');
          return message.channel.send(`Oh... That song did not load.  Please try again.`);
        }
      }
    }
    // This is a search string
    else {

      // Retreive the song search
      const info = await YouTube.searchOne(search)
      .catch(error => {
        logger.error(error);
        return message.channel.send(`An error occured processing that song.  Please try again.`);
      });

      // Make sure a video result is returned.
      if(info){
        await message.channel.send(`Adding ***${info.title}*** to the queue.`);
        const song = new Song(`https://www.youtube.com/watch?v=${info.id}`, info.title);
        await audioPlayer.enqueue(song);
      }else{
        logger.warn('Had trouble processing a song');
        return message.channel.send(`Oh... That song did not load.  Please try again.`);
      }
    }
  }

  async AnotherStop(guildid){
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
