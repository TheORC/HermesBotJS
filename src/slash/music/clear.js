const Slash = require('../../base/Slash.js');
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class SlashClear extends Slash {

  constructor(client) {
    super(client, {
      name: "clear",
      description: "Clears the music queue.",
      category: "Test Catagory",
      usage: "/clear"
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

    if(audioPlayer.getQueue().length === 0){
      return await clientMessenger.log(interaction, 'The queue is empty.');
    }

    audioPlayer.clearQueue();
    await clientMessenger.log(interaction, 'The music queue has been cleared.');
  }
};
