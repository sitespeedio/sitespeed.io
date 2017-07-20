'use strict';

const urlParser = require('url'),
  messageMaker = require('../support/messageMaker');

const make = messageMaker('url-reader').make;

module.exports = {
  open(context, options) {
    this.options = options;
  },
  findUrls(queue) {
    for (const url of this.options.urls) {
      queue.postMessage(
        make('url', {}, { url: url, group: urlParser.parse(url).hostname })
      );
    }
  }
};
