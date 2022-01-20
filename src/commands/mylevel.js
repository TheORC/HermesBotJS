const Command = require("../base/Command.js");

module.exports = class MyLevel extends Command {
 constructor(client) {
   super(client, {
     name: "mylevel",
     description: "Displays your permission level for your location.",
     usage: "mylevel",
     guildOnly: true
   });
 }

 async run(message, args, level) {
   message.reply({ content: `Your permission level is: ${level}`});
 }
};
