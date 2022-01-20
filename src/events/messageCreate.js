const { defaultSettings } = require('../config.js');
const logger = require('../modules/Logger.js')

module.exports = class {
  constructor(client){
    this.client = client;
  }

  async run(message){

    // We don't process the message if its a bot
    if(message.author.bot) return;

    // Get guild settings
    const settings = defaultSettings;

    // Check of the bot was mentioned
    const prefixMention = new RegExp(`^<@!?${this.client.user.id}> ?$`);
    if(message.content.match(prefixMention)){
      return message.reply(`My prefix on this guild is \`${settings.prefix}\``)
    }

    // Check if the message starts with a prefix
    const prefix = new RegExp(`^<@!?${this.client.user.id}> |^\\${settings.prefix}`).exec(message.content);
    if(!prefix) return;

    // Get the command and agrs
    const args = message.content.slice(prefix[0].length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Get the member which issued the command, even if they are offline
    if(message.guild && !message.member) await message.guild.members.fetch(message.author);

    // Get the command we are going to run
    const cmd = this.client.container.commands.get(command) || this.client.container.commands.get(this.client.container.aliases.get(command));
    if(!cmd) return;

    if(cmd && !message.guild && cmd.conf.guildOnly)
      return message.channel.send('This command is unavailable via private message. Please run this command in a guild.')

    // Check if the command can be run
    if(!cmd.conf.enabled) return;

    // TODO: implement permissions
    message.settings = defaultSettings;

    try{
      await cmd.run(message, args, 0);
      logger.cmd(`${message.author.id} ran command ${cmd.help.name}`);
    }catch(e){
      console.log(e);
      message.channel.send({ content: `There was a problem with your request.\n\`\`\`${e.message}\`\`\`` })
        .catch(e => console.error("An error occurred replying on an error", e));
    }
  }
};
