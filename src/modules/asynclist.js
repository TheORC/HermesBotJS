"use strict";

const { shuffleArray } = require('../utils/function.js');

const nextLoop = (() => {
  if (typeof setImmediate === 'function') {
    return setImmediate;
  }
  return function(fn) { return setTimeout(fn, 0); };
})();

class WaitQueue {

  constructor() {
    this.queue = [];
    this.listeners = [];
  }

  getArray() {
    return this.queue;
  }

  getLength() {
    return this.queue.length;
  }

  empty() {
    this.queue = [];
  }

  clear(){
    this.queue = [];
  }

  clearListeners () {
    for(const listener of this.listeners){
      listener(new Error('Clear Listeners'));
    }
    this.listeners = [];
  }

  shuffle() {
    this.queue = shuffleArray(this.queue);
  }

  unshift(item) {
    this.queue.unshift(item);
    this._flush();
    return this.queue.length;
  }

  push(item) {
    this.queue.push(item);
    this._flush();
    return this.queue.length;
  }

  async shift() {
    return new Promise((resolve, reject) => {
      if(this.queue.length > 0){
        return resolve(this.queue.shift());
      }else{
        this.listeners.push((err) => {
          if(err){
            return reject(err);
          }
          return resolve(this.queue.shift());
        });
      }
    });
  }

  async pop() {
    return new Promise((resolve, reject) => {
      if(this.queue.length > 0){
        return resolve(this.queue.pop());
      }else{
        this.listeners.push((err) => {
          if(err){
            return reject(err);
          }
          return resolve(this.queue.pop());
        });
      }
    });
  }

  _flush(){
    if(this.queue.length > 0 && this.listeners.length > 0){
      const listener = this.listeners.shift();
      listener.call(this);
      nextLoop(this._flush.bind(this));
    }
  }
}

module.exports = WaitQueue;
