const AudioPlayer = require('./AudioPlayer');
const Song = require('./song.js');

const { getInfo } = require('ytdl-getinfo');
const YouTube = require("youtube-sr").default;

const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

const { isUrl } = require('../utils/function.js');

class MusicController {

  constructor(client, settings){

    this.client = client;
    this.settings = settings;

    // Create a list of the audio players
    this.players = {}
  }

  // Function for getting an audio player
  getAudioPlayer(guildid){
    return this.players[guildid];
  }

  async ConnectToChannel(channel){

    const connection = joinVoiceChannel({
      channelId: channel.id,
  		guildId: channel.guild.id,
  		adapterCreator: channel.guild.voiceAdapterCreator
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    }catch(error){
      connection.destroy();
      throw error;
    }

    return new AudioPlayer(this.client, connection);
  }

  async Play(message, search) {

    const channel = message.member?.voice.channel;

    if(!channel)
      return message.channel.send('This command can only be used when in a voice channel.');

    let audioPlayer = this.getAudioPlayer(message.guild.id);

    // The bot is not in a channel yet
    if(!audioPlayer){

      // Create the voice connection
      audioPlayer = await this.ConnectToChannel(channel);
      this.players[message.guild.id] = audioPlayer;
    }

    // Huh, looks like it might have been removed.
    if(audioPlayer.voiceConnection.state.status === VoiceConnectionStatus.Destroyed){
      delete this.players[message.guild.id];
      audioPlayer = await this.ConnectToChannel(channel);
      this.players[message.guild.id] = audioPlayer;
    }

    // Check if a url was provided
    if(isUrl(search)){

      // This is a playlist
      if(search.includes('list=P')){
        const info = await YouTube.getPlaylist(search).then(playlist => playlist.fetch()).catch(console.error);

        await message.channel.send(`Adding ${info.videoCount} songs to the queue.`);

        // Add the playlist to the queue
        for(const video of info.videos){
          const song = new Song(`https://www.youtube.com/watch?v=${video.id}`, video.title);
          await audioPlayer.enqueue(song);
        }
      }

      // Just a url
      else {
        const info = await YouTube.getVideo(search);

        await message.channel.send(`Adding ***${info.title}*** to the queue.`);

        const song = new Song(`https://www.youtube.com/watch?v=${info.id}`, info.title);
        await audioPlayer.enqueue(song);
      }
    }
    // This is a search string
    else {
      const info = await YouTube.searchOne(search);

      await message.channel.send(`Adding ***${info.title}*** to the queue.`);

      const song = new Song(`https://www.youtube.com/watch?v=${info.id}`, info.title);
      await audioPlayer.enqueue(song);
    }
  }

  async Pause(message){

    const audioPlayer = this.getAudioPlayer(message.guild.id);
    if(!audioPlayer)
      return message.channel.send('The bot is not playing any music.');

    await audioPlayer.pause();
  }

  async Resume(message){

    const audioPlayer = this.getAudioPlayer(message.guild.id);
    if(!audioPlayer)
      return message.channel.send('The bot is not playing any music.');

    await audioPlayer.resume();
  }

  async Skip(message){

    const audioPlayer = this.getAudioPlayer(message.guild.id);
    if(!audioPlayer)
      return message.channel.send('The bot is not playing any music.');

    await audioPlayer.skip();
  }

  async Shuffle(message){

    const audioPlayer = this.getAudioPlayer(message.guild.id);
    if(!audioPlayer)
      return message.channel.send('The bot is not playing any music.');

    await audioPlayer.shuffle();
    await message.channel.send('The queue has been shuffled.');
  }

  async Queue(message){

    const audioPlayer = this.getAudioPlayer(message.guild.id);
    if(!audioPlayer)
      return message.channel.send('The bot is not playing any music.');

    const queue = audioPlayer.getQueue();

    if(queue.length === 0){
      return await message.channel.send('Currently no songs in the queue');
    }

    const reply = queue
				.slice(0, 5)
				.map((track, index) => `${index + 1}) ${track.title}`)
				.join('\n');

		await message.reply(`${reply}`);
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
