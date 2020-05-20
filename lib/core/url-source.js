'use strict';

const urlParser = require('url');
const messageMaker = require('../support/messageMaker');
const make = messageMaker('url-reader').make;

module.exports = {
  open(context, options) {
    this.options = options;
  },
  findUrls(queue) {
    for (const url of this.options.urls) {
      queue.postMessage(
        make(
          'url',
          {},
          {
            url: url,
            group:
              this.options.urlsMetaData &&
              this.options.urlsMetaData[url] &&
              this.options.urlsMetaData[url].groupAlias
                ? this.options.urlsMetaData[url].groupAlias
                : urlParser.parse(url).hostname
          }
        )
      );
    }
  }
};
