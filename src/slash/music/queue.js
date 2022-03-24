const Slash = require('../../base/Slash.js');
const clientMessenger = require('../../modules/clientmessenger.js');
const { HEmbed } = require('../../utils/embedpage.js');

module.exports = class SlashClear extends Slash {

  constructor(client) {
    super(client, {
      name: "queue",
      description: "Shows the music queue.",
      category: "Test Catagory",
      usage: "/queue"
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

    // Check that there are songs.
    if(audioPlayer.getQueue().length === 0){
      return await clientMessenger.log(interaction, 'The queue is empty.');
    }

    // [Guide](https://discordjs.guide/ 'optional hovertext')
    const queue = audioPlayer.getQueue(); // []
    const sliceQueue = queue.slice(0, 5);
    const reply = sliceQueue
                  .map((track) => `[${track.title}](${track.url})`)
                  .join('\n');

    const queueEmbed = new HEmbed({
      title: `Upcoming - Next ${sliceQueue.length}`,
      description: reply,
      footer: `${queue.length} song(s)`
    });

    await interaction.reply({ embeds: [queueEmbed] });
  }
};
