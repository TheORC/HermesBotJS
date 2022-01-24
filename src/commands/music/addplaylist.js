const logger = require('../../modules/Logger.js');
const Command = require("../../base/Command.js");

const { getVoiceConnection } = require('@discordjs/voice');

module.exports = class AddPlayListMusic extends Command {


  constructor(client){
    super(client, {
      name: "addplaylist",
      description: "Adds a playlist to the bot.",
      category: "Music Player",
      usage: "addplaylist [playlist url]",
      aliases: ["ap"]
    });
    this.client = client;
  }

  async run(message, args, level){

    // Get the channel if it exists of the person who typed the command.
    const memberVoiceChannel = message.member.voice?.channel;
    if(!memberVoiceChannel)
      return message.channel.send('This command can only be used when in a voice channel.');



    console.log('done');
  }
}
