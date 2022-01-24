const logger = require('../modules/Logger.js');

const { resolve } = require('path');
const { readdir } = require('fs').promises;

function shuffleArray(arr){
  arr.sort(() => Math.random() - 0.5);
  return arr;
}

function isUrl(str){

  const pattern = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})'
  );
  return !!pattern.test(str);
}

async function recursiveSearch(dir) {

  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? recursiveSearch(res) : res;
  }));

  return Array.prototype.concat(...files);
}

async function asyncSubFileSearch(dir, split) {

  const files = await recursiveSearch(dir);
  const namedArray = [];

  for(const fileName of files){
    let sp = fileName.split(split)[1];
    sp = sp.replaceAll(`\\`, `\/`);
    namedArray.push(sp);
  }
  return namedArray;
}

const asyncCallWithTimeout = async (asyncPromise, timeLimit) => {
  return Promise.race([
      asyncPromise,
      new Promise(function(resolve, reject){
          setTimeout(function() {
              reject('timeout');
          }, timeLimit);
      })
  ]);
}

module.exports = { asyncSubFileSearch, isUrl, shuffleArray, asyncCallWithTimeout }
