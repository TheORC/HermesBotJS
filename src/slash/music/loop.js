const Slash = require('../../base/Slash.js');
const clientMessenger = require('../../modules/clientmessenger.js');

module.exports = class SlashLoop extends Slash {

  constructor(client) {
    super(client, {
      name: "loop",
      description: "Loops the current song or playlist.",
      category: "Test Catagory",
      usage: "/loop"
    });

    this.slashCommand
    .addStringOption(option =>
		    option.setName('type')
  			.setDescription('Loop song or playlist')
  			.setRequired(true)
  			.addChoices(
          { name: 'Song', value: 'song' },
          { name: 'Queue', value: 'queue' },
          { name: 'Stop', value: 'stop' }
          ));
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

    const command = interaction.options.getString('type');
    switch (command) {
      case 'song':
        audioPlayer.setLoopSong();
        await clientMessenger.log(interaction, 'The current song will be looped.');
        break;
      case 'queue':

        // Check for at least 1 song in the queue
        if(audioPlayer.getQueue().length === 0){
          return await clientMessenger.warn(interaction, 'There needs to be at least 1 song in the queue to loop the queue.');
        }

        audioPlayer.setLoopPlaylist();
        await clientMessenger.log(interaction, 'The queue will be looped.');
        break;
      case 'stop':
        audioPlayer.disableLoop();
        await clientMessenger.log(interaction, 'Looping has been disabled.');
        break;
      default:
        return await clientMessenger.warn(interaction, 'Unknown loop option, please use either song, queue, or stop.');
    }
  }
};
