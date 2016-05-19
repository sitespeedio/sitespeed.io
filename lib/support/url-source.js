'use strict';

const lineReader = require('line-reader'),
  Promise = require('bluebird'),
  log = require('intel'),
  messageMaker = require('../support/messageMaker');

const make = messageMaker('url-reader').make;

const eachLine = Promise.promisify(lineReader.eachLine);

function linesFromFile(file) {
  const lines = [];

  return eachLine(file, (line) => {
    if (line.trim().length > 0) {
      lines.push(line.trim());
    }
  }).return(lines);
}

module.exports = {
  open(context, options) {
    this.urls = options._;
  },
  findUrls(queue) {
    const urls = this.urls.map((url) => url.trim());

    return Promise.reduce(urls, (urls, url) => {
        if (url.startsWith('http')) {
          urls.push(url);
          return urls;
        } else {
          return linesFromFile(url)
            .then((lines) => {
              log.info('Will analyse %s URLs from %s', lines.length, url);
              return urls.concat(lines);
            });
        }
      }, [])
      .each((url) => queue.postMessage(make('url', {}, {url})));
  }
};
