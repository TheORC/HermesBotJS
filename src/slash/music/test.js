const Slash = require('../../base/Slash.js');

module.exports = class Test extends Slash {

  constructor(client) {
    super(client, {
      name: "test",
      description: "Simple test command.",
      category: "Test Catagory",
      usage: "/test"
    });
  }

  async run(interaction){
    await interaction.deferReply();
    console.log(interaction);
  }
};
