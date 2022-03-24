"use strict";

const { HEmbed,  HEmbedPage} = require('../utils/embedpage.js');
const { DatabaseAdaptar } = require('./database.js');


/**
 * EmbedLoader
 *
 * When the bot is restarted we need to reload all the embeds.
 * If the bot has permissions, this class can bed used to load
 * them.
 *
 */
class EmbedLoader {
  constructor() {

    this.db = new DatabaseAdaptar({
      server:   process.env.db_host,
      username: process.env.db_user,
      password: process.env.db_password,
      database: process.env.db
    });

    this.db.disconnect();
  }

  loadEmbeds(guilId) {

  }
}

/**
 * EmbedManager
 *
 * Manged the sending of embeds to the requested channels.
 *
 */
class EmbedManager {

  constructor(client) {
    this.client = client;
    this.embeds = {};

    this.emotes = ["◀", "⬅", "❎", "➡", "▶"];
  }

  /**
   * Check if a message is an embedpage.
   *
   * @param {string} messageId Message id to check
   *
   * @returns {boolean} Description
   */
  check(messageId) {

    if(messageId === undefined){
      throw new Error('check: messageId must not be undefined.');
    }

    return this.embeds[messageId] !== undefined;
  }

  /**
   * Creates and adds a Multi page embed to the message channge.
   *
   * @param {Message} message  Message containing chanel information
   * @param {array}   items    List of fields to add to the embed
   * @param {object}  settings Settings for the embed
   *
   */
  async sendEmbedPage(message, items, settings) {

    if(message === undefined){
      throw new Error('addPage: message must not be undefined');
    }

    if(items === undefined){
      throw new Error('addPage: items must not be undefined');
    }

    // Create the embed
    const newEmbed = new HEmbedPage(10, settings);
    newEmbed.addItems(items);

    // Send the embed
    const msg = await message.channel.send({ embeds: [newEmbed] });
    this.embeds[msg.id] = newEmbed;

    // Add message reactions
    for(let i = 0; i < this.emotes.length; i++){
      await msg.react(this.emotes[i]);
    }
  }

  /**
   * Creates and sends a single page embed
   *
   * @param {Message} message  Message containing chanel information
   * @param {array}   items    List of fields to add to the embed
   * @param {object}  settings Settings for the embed
   *
   * @returns {type} Description
   */
  async sendEmbed(message, items, settings) {
    if(message === undefined){
      throw new Error('addPage: message must not be undefined');
    }

    if(items === undefined){
      throw new Error('addPage: items must not be undefined');
    }

    // Create the embed
    const newEmbed = new HEmbed(settings);
    newEmbed.addItems(items);

    // Send the embed
    await message.channel.send({ embeds: [newEmbed] });
  }

  /**
   * Updates an embed page.  This checks wich emoji
   * was selected and performs the required task.
   *
   * @param {number}          messageId Embeded message id
   * @param {MessageReaction} reaction  Reaction performed
   *
   */
  async updatePage(messageId, reaction){

    if(messageId === undefined){
      throw new Error('updatePage: messageId must not be undefined.');
    }

    if(reaction === undefined){
      throw new Error('updatePage: reaction must not be undefined.');
    }

    let embed = this.embeds[messageId];

    if(embed === undefined){
      throw new Error('updatePage: Tried to update a embed but it is undefined...');
    }

    // Check what emoji was selected
    switch(reaction.emoji.name){
      case '◀':
        embed.firstPage();
        break;
      case '⬅':
        embed.prevPage();
        break;
      case '➡':
        embed.nextPage();
        break;
      case '▶':
        embed.lastPage();
        break;
      default:
        console.log('Error, unknown quote receaived...');
        break;
    }

    // Update the embed
    await reaction.message.edit({ embeds: [embed] });
  }
}

module.exports = EmbedManager;
