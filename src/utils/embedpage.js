"use strict";

const { MessageEmbed } = require('discord.js');

class PageChunk {

  constructor(items) {
    this.items = items;
  }

  getItems() {
    return this.items;
  }

  static GetChuncks(items, chunkSize) {

    if(typeof(items) !== 'object' || Object.prototype.toString.call(items) !== '[object Array]'){
      throw new Error('GetChunks: `items` is required to be an array.');
    }

    if(typeof(chunkSize) !== 'number'){
      throw new Error('GetChunks: `chunkSize` is required to be a number.');
    }

    let chunks = [], tmpChunk;

    let iterations = Math.floor(items.length / chunkSize);
    let remainder = items.length % chunkSize;

    for( let i = 0; i < iterations; i++ ) {
      tmpChunk = new PageChunk(items.slice(i * chunkSize, (i * chunkSize) + chunkSize));
      chunks.push(tmpChunk);
    }

    if(remainder !== 0){
      tmpChunk = new PageChunk(items.slice(iterations * chunkSize, (iterations * chunkSize) + remainder));
      chunks.push(tmpChunk);
    }

    return chunks;
  }

}

class EmbedPage extends MessageEmbed {

  constructor(info, pageSize, ...args) {
    super(...args);

    // Apply defualt values
    if(info === undefined) {
      info = {};
    }

    if(!pageSize){
      pageSize = 10;
    }

    if(!info.title){
      info.title = 'Temp Title';
    }

    if(!info.description){
      info.description = 'Temp Description';
    }

    if(!info.footer){
      info.footer = 'Temp Footer';
    }

    if(!info.inline){
      info.inline = false;
    }

    if(!info.colour){
      info.colour = '0x1f8b4c';
    }

    // Embed information
    this.title = info.title;
    this.description = info.description;
    this.footer = info.footer;
    this.color = info.colour;
    this.info = info;

    // Chunk information
    this.chunkSize = pageSize;
    this.items = null;
    this.chunks = null;
    this.currentChunk = null;

    // Page information
    this.currentPage = 0;
    this.maxPages = 0;

  }

  /**
   * Adds items to the embed.  This method will `chunk` the
   * items bassed on the chunk size and get the embed ready
   * for pages.
   *
   * @param {object Array} items An array of items to include in the embed
   *
   */
  addItems(items) {

    if(!items){
      throw new Error('addItems: `items` can not be undefined.');
    }

    if(typeof(items) !== 'object' || (typeof(items) === 'object' && Object.prototype.toString.call(items) !== '[object Array]')) {
      throw new Error('addItems: `items` is wrong type.  It must be a list.');
    }

    this.items = items;
    this.chunks = PageChunk.GetChuncks(items, this.chunkSize);
    this.maxPages = this.chunks.length - 1;

    this.setPage();
  }


  /**
   * Inserts the current page into the embed.
   *
   */
  setPage() {
    this.currentChunk = this.chunks[this.currentPage];
    this.fields = [];

    let tmpChunk = this.currentChunk.getItems();

    for(let i = 0; i < tmpChunk.length; i++){
      this.addField(tmpChunk[i][0], tmpChunk[i][1], this.info.inline);
    }

    this.setFooter({text: `Page ${this.currentPage+1} of ${this.maxPages+1}`});
  }

  /**
   * Changes to the next embed page.
   *
   */
  nextPage() {
    if(this.currentPage === this.maxPages){
      return;
    }

    this.currentPage += 1;
    this.setPage();
  }

  /**
   * Changes to the previouse embed page.
   *
   */
  prevPage() {
    if(this.currentPage === 0){
      return;
    }

    this.currentPage -= 1;
    this.setPage();
  }


  /**
   * Changes to the first embed page.
   *
   */
  firstPage() {
    if(this.currentPage === 0){
      return;
    }

    this.currentPage = 0;
    this.setPage();
  }

  /**
   * Changes to the last embed page.
   */
  lastPage() {
    if(this.currentPage === this.maxPages){
      return;
    }

    this.currentPage = this.maxPages;
    this.setPage();
  }
}

module.exports = EmbedPage;
