"use strict";

const { HEmbed } = require('../utils/embedpage.js');

const MessageEnum = {
  LOG: 1,
  WARN: 2,
  ERROR: 3
};

exports.log = async (channel, content, type = MessageEnum.LOG) => {

  let embed;
  switch(type){
    case MessageEnum.LOG:
      embed = new HEmbed({title: '', description: `🗨️ ${content}`, inline: true});
      break;
    case MessageEnum.WARN:
      embed = new HEmbed({title: '', description: `⚠️ ${content}`, inline: true});
      break;
    case MessageEnum.ERROR:
      embed = new HEmbed({title: '', description: `❌ ${content}`, inline: true});
      break;
    default:
      throw new TypeError('Message type must by either, LOG, WARN, or ERROR');
  }

  try {
    if(channel.type && channel.type === 'APPLICATION_COMMAND') {
      await channel.reply({ embeds: [embed] });
    }else{
      await channel.send({embeds: [embed]});
    }

  } catch(err){
    console.log(err);
  }
};

exports.warn  = async (...args) => this.log(...args, MessageEnum.WARN);
exports.error = async (...args) => this.log(...args, MessageEnum.ERROR);
