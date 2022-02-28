const Slash = require('../../base/Slash.js');
const logger = require('../../modules/Logger.js');
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class SlashPlayNext extends Slash {

  constructor(client) {
    super(client, {
      name: "playnext",
      description: "Simple play command.",
      category: "Test Catagory",
      usage: "/playnext"
    });

    this.slashCommand.addStringOption(option =>
		    option.setName('search')
        .setRequired(true)
  			.setDescription('The song search or url'));
  }

  async run(interaction){
    // Make sure the member is in a channel.
    let channel;
    if(interaction.member.voice.channelId === null){
      return await clientMessenger.warn(interaction, 'This command can only be used from a voice channel.');
    }

    // The user is in a channel.  Get it.
    else{
      channel = interaction.member.voice.channel;
    }

      // The music bot is not in a channel
    let botVoiceChannel;
    if(interaction.guild.me.voice){
      botVoiceChannel = interaction.guild.me.voice.channel;
    }

    // Check if the bot is in a channel
    if(!botVoiceChannel || botVoiceChannel.id !== channel.id){

      // The bot is either not conencted or in another channel.
      logger.log('Connecting music bot');
      await this.client.musicplayer.ConnectToChannel(channel);
    }

    // Get the audio player
    const audioPlayer = this.client.musicplayer.getAudioPlayer(interaction.channel.guild.id);
    if(!audioPlayer){

      // This is true when the server restarts and the bot has not yet left the channel.
      logger.warn('Attempting to connect bot in rare case.');
      await this.client.musicplayer.ConnectToChannel(channel);
    }

    // We are in a voice channel
    await this.client.musicplayer.PlayNext(interaction, interaction.options.getString('search'));
  }

};
