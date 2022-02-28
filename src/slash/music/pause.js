const Slash = require('../../base/Slash.js');
const logger = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');

const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = class SlashPause extends Slash {

  constructor(client) {
    super(client, {
      name: "pause",
      description: "Pause the current song playing.",
      category: "Test Catagory",
      usage: "/pause"
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

    if(audioPlayer.getStatus() !== AudioPlayerStatus.Playing){
      return await clientMessenger.log(interaction, 'The music bot is not playing anything.');
    }

    // Ok, lets pause the player
    await audioPlayer.pause();
    await clientMessenger.log(interaction, 'The music bot is paused.');
    logger.log('Music bot has been paused.');
  }
};
