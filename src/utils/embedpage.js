"use strict";

const { MessageEmbed } = require('discord.js');


/**
 * PageChunk
 *
 * This class provides a util which can convert a list of items in 'chunks'.
 * This is used in correlation with the `EmbedPage` to create pages.
 */
class PageChunk {

  /**
   * constructor - Description
   *
   * @param {array} items List of items to be `chuncked`
   */
  constructor(items) {

    if(items === undefined) { throw new Error('PageChunk: items can not be null'); }
    if(typeof(items) !== 'object' || Object.prototype.toString.call(items) !== '[object Array]') {
      throw new Error('PageChunk: `items` is required to be an array');
    }

    this.items = items;
  }

  /**
   * getItems
   *
   * Returns the items in this chunk
   *
   * @returns {array} List of items
   */
  getItems() {
    return this.items;
  }

  /**
   * @static GetChuncks
   *
   * This method takes a list of items and splits them into even
   * sized `chunks`.  The last chunk in the list has
   * size <= chunkSize
   *
   * @param {array} items     List of items to be `chunked`
   * @param {number} chunkSize Size of chunks
   *
   * @returns {object Arrat} List of `PageChunk`
   */
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

/**
 * HermesEmbed
 *
 * Base level message embed.
 *
 * @extends MessageEmbed
 */
class HEmbed extends MessageEmbed {

  constructor(settings, ...args){

    super(...args);

    // Apply defualt values
    if(settings === undefined) {
      settings = {};
    }

    if(settings.title === undefined){
      settings.title = 'Temp Title';
    }

    if(settings.description === undefined){
      settings.description = 'Temp Description';
    }

    if(settings.footer === undefined){
      settings.footer = '';
    }

    if(settings.inline === undefined){
      settings.inline = false;
    }

    if(settings.colour === undefined){
      settings.colour = '0x1f8b4c';
    }

    // Embed information
    this.title       = settings.title;
    this.description = settings.description;
    this.color       = settings.colour;
    this.inline      = settings.inline;
    this.footer      = { text: settings.footer };
    this.info        = settings;
  }


  addItems(items) {
    if(!items){
      throw new Error('addItems: `items` can not be undefined.');
    }

    if(typeof(items) !== 'object' || (typeof(items) === 'object' && Object.prototype.toString.call(items) !== '[object Array]')) {
      throw new Error('addItems: `items` is wrong type.  It must be a list.');
    }

    for(let i = 0; i < items.length; i++){
      this.addField(items[i], items[i], this.info.inline);
    }
  }
}

/**
 * EmbedPage
 *
 * Multiple page embed used to display large lists.
 *
 * @extends HermesEmbed
 */
class HEmbedPage  extends HEmbed {

  /**
   *
   * @param {number}  chunkSize Size of each page
   * @param {array}   args
   *
   */
  constructor(chunkSize, ...args) {
    super(...args);

    if(typeof(chunkSize) === 'undefined' || typeof(chunkSize) !== 'number'){
      throw new Error('EmbedPage: `chunkSize` must be a number');
    }

    // Chunk information
    this.chunkSize = chunkSize;
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
   * @param {array} items An array of items to include in the embed
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

module.exports = { HEmbed,  HEmbedPage};
