"use strict";

const Command = require("../../base/Command.js");
const clientMessenger = require('../../modules/clientmessenger.js');

const { HEmbed } = require('../../utils/embedpage.js');

module.exports = class QueueMusic extends Command {

  constructor(client){

    super(client, {
      name: "queue",
      description: "Shows the music queue.",
      category: "Music Player",
      usage: "queue",
      aliases: ["q"]
    });

    this.client = client;
  }

  async run(message){

    // Make sure the member is in a channel.
    if(message.member.voice.channelId === null){
      return await clientMessenger.warn(message.channel, 'This command can only be used from a voice channel.');
    }

    // Make sure the bot is in a channel.
    const audioPlayer = await this.client.musicplayer.getAudioPlayer(message.guild.id);
    if(!audioPlayer){
      return await clientMessenger.log(message.channel, 'The music bot is not playing anything.');
    }

    // Check that there are songs.
    if(audioPlayer.getQueue().length === 0){
      return await clientMessenger.log(message.channel, 'The queue is empty.');
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

    await message.channel.send({embeds: [queueEmbed]});
  }
};
