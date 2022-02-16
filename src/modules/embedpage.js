"use strict";

const {MessageEmbed} = require('discord.js');

class PageChucnk {

}


class EmbedPage extends MessageEmbed {

  constructor(items, ...args) {
    super(...args);

    this.chunks = [];
    this.items = items;
  }

}
