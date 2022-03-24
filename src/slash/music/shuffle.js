const Slash = require('../../base/Slash.js');
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class SlashShuffle extends Slash {

  constructor(client) {
    super(client, {
      name: "shuffle",
      description: "Shuffle the songs in the queue.",
      category: "Test Catagory",
      usage: "/shuffle"
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
      return await clientMessenger.log(interaction, 'The music queue is empty.');
    }

    // We are in a voice channel, pause the song
    await audioPlayer.shuffleQueue();
    await clientMessenger.log(interaction, 'The music queue has been shuffled.');
  }
};
