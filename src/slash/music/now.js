const Slash = require('../../base/Slash.js');
const progressBar = require('../../utils/progressbar.js');
const clientMessenger = require('../../modules/clientmessenger.js');
const { HEmbed } = require('../../utils/embedpage.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = class SlashNow extends Slash {

  constructor(client) {
    super(client, {
      name: "now",
      description: "Shows the current song being played.",
      category: "Test Catagory",
      usage: "/now"
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
      return await clientMessenger.log(interaction, 'The bot is not playing anything.');
    }

    const currentSong = audioPlayer.getCurrentSong();
    if(!currentSong){
      return await clientMessenger.log(interaction, 'The music bot is not playing anything.');
    }

    const songDuration = currentSong.duration;
    const playedDuration = audioPlayer.currentResorce.playbackDuration;

    const nowEmbed = new HEmbed({
      title: '',
      description: '',
      inline: false
    });
    nowEmbed.addFields(
      {name:'**Now Playing**', value: `[${currentSong.title}](${currentSong.url})` },
      {name:`Played Duration`, value: `${progressBar(playedDuration, songDuration, 20)}`},
      {name: 'Requested By', value: `${currentSong.requester}`},
    );

    await interaction.reply({ embeds: [nowEmbed] });
  }
};
