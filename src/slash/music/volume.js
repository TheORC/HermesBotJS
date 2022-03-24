const Slash = require('../../base/Slash.js');
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class SlashVolume extends Slash {

  constructor(client) {
    super(client, {
      name: "volume",
      description: "Changes the music volume.",
      category: "Test Catagory",
      usage: "/volume"
    });

    this.slashCommand
    .addIntegerOption(option =>
		    option.setName('volume')
  			.setDescription('Changes the audio volume')
  			.setRequired(true));
  }

  async run(interaction) {

    // Check the args validity
    const volume = interaction.options.getInteger('volume');
    if(volume <= 0 || volume > 100){
      return await clientMessenger.warn(interaction, 'Make sure the volume is between 1 and 100.');
    }

    // Make sure the member is in a channel.
    if(interaction.member.voice.channelId === null){
      return await clientMessenger.warn(interaction, 'This command can only be used from a voice channel.');
    }

    // Make sure the bot is in a channel.
    const audioPlayer = await this.client.musicplayer.getAudioPlayer(interaction.guild.id);
    if(!audioPlayer){
      return await clientMessenger.log(interaction, 'The music bot is not playing anything.');
    }

    audioPlayer.setVolume(volume/100);
    await clientMessenger.log(interaction, `The volume has been changed to ${volume}%.`);
  }
};
