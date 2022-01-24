const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

module.exports = class ShuffleMusic extends Command {

  constructor(client){
    super(client, {
      name: "shuffle",
      description: "Shuffle the songs in the queue.",
      category: "Music Player",
      usage: "shuffle",
      aliases: ['sh']
    });

    this.client = client;
  }

  async run(message, args, level){

    // Make sure the member is in a channel.
    const channel = message.member.voice?.channel;
    if(!channel)
      return message.channel.send('This command can only be used when in a voice channel.');

    // Make sure the bot is in a channel.
    const audioPlayer = await this.client.musicplayer.getAudioPlayer(message.guild.id);
    if(!audioPlayer)
      return await message.channel.send('The bot is not currently in a channel.');

    // Make syre there are songs to be shuffled.
    if(audioPlayer.getQueue().length == 0)
      return await message.channel.send('There are no songs in the queue.');

    // We are in a voice channel, pause the song
    await audioPlayer.shuffle();
    await message.channel.send('The queue has been shuffled.');
  }
}
