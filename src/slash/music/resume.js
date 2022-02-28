const Slash = require('../../base/Slash.js');
const logger = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');

const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = class SlashResume extends Slash {

  constructor(client) {
    super(client, {
      name: "resume",
      description: "Resumes the music bot.",
      category: "Test Catagory",
      usage: "/resume"
    });
  }

  async run(interaction) {

    // Make sure the member is in a channel.
    if(interaction.member.voice.channelId === null){
      return await clientMessenger.warn(interaction, 'This command can only be used from a voice channel.');
    }

    // Make sure the bot is in a channel.
    const audioPlayer = await this.client.musicplayer.getAudioPlayer(interaction.guild.id);
    if(!audioPlayer){
      return await clientMessenger.log(interaction, 'The music bot is not playing anything.');
    }

    // Make sure the bot is playing a song.
    if(audioPlayer.getStatus() !== AudioPlayerStatus.Paused){
      return await clientMessenger.log(interaction, 'The bot is already playing.');
    }

    // We are in a voice channel, resume the song.
    await audioPlayer.resume();
    await clientMessenger.log(interaction, 'The bot has been resumed.');
    logger.log('Music bot has been resumed.');
  }
};
