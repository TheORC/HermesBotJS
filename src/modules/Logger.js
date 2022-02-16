"use strict";

const { red, magenta, gray, yellow, white, green } = require('colorette');

const LogEnum = {
  LOG: 1,
  WARN: 2,
  ERROR: 3,
  DEBUG: 4,
  CMD: 5,
  READY: 6
};

exports.log = (content, type = LogEnum.LOG) => {
  switch(type){
    case LogEnum.LOG: return console.log(`${gray('[LOG]')} ${content}`);
    case LogEnum.WARN: return console.log(`${yellow('[WARN]')} ${content}`);
    case LogEnum.ERROR: return console.log(`${red('[ERROR]')} ${content}`);
    case LogEnum.DEBUG: return console.log(`${magenta('[DEBUG]')} ${content}`);
    case LogEnum.CMD: return console.log(`${white('[CMD]')} ${content}`);
    case LogEnum.READY: return console.log(`${green('[READY]')} ${content}`);
    default: throw new TypeError('Loger type must by either, LOG, WARN, ERROR, DEBUG, CMD, or READY');
  }
};

exports.error = (...args) => this.log(...args, LogEnum.ERROR);
exports.warn  = (...args) => this.log(...args, LogEnum.WARN);
exports.debug = (...args) => this.log(...args, LogEnum.DEBUG);
exports.cmd   = (...args) => this.log(...args, LogEnum.CMD);
exports.ready = (...args) => this.log(...args, LogEnum.READY);
