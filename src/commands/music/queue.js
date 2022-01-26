const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

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

  async run(message, args, level){

    const channel = message.member?.voice.channel;

    // Make sure the member is in a channel.
    if(!channel)
      return message.channel.send('This command can only be used when in a voice channel.');

    // Make sure the bot is in a channel.
    const audioPlayer = await this.client.musicplayer.getAudioPlayer(message.guild.id);
    if(!audioPlayer)
      return await message.channel.send('The bot is not currently in a channel.');

    // We only message when there is a queue.
    if(audioPlayer.getQueue().length == 0)
      return await message.channel.send('There are no songs in queue.');

    const queue = audioPlayer.getQueue(); // []

    const reply = queue
        .slice(0, 5)
				.map((track, index) => `${index + 1}) ${track.title}`)
				.join('\n');

		await message.reply(`${reply}`);
  }
};
