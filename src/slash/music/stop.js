const Slash = require('../../base/Slash.js');
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class SlashStop extends Slash {

  constructor(client) {
    super(client, {
      name: "stop",
      description: "Make the music bot stop.",
      category: "Test Catagory",
      usage: "/stop"
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

    // We are in a voice channel, pause the song
    await this.client.musicplayer.Stop(interaction);
  }
};
