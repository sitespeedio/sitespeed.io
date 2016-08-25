'use strict';

const lineReader = require('line-reader'),
  Promise = require('bluebird'),
  log = require('intel'),
  urlParser = require('url'),
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
        urls.push({url, group: urlParser.parse(url).hostname});
        return urls;
      } else {
        const filePath = url;
        return linesFromFile(filePath)
          .then((lines) => {
            log.info('Will analyse %s URLs from %s', lines.length, filePath);

            for (let line of lines) {
              urls.push({url: line, group: urlParser.parse(line).hostname});
            }

            return urls;
          });
      }
    }, [])
      .each((urlData) => {
        queue.postMessage(make('url', {}, {url: urlData.url, group: urlData.group}))
      });
  }
};
