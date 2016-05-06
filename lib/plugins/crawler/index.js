'use strict';

const Promise = require('bluebird'),
  path = require('path'),
  urlParser = require('url'),
  merge = require('lodash.merge'),
  log = require('intel'),
  messageMaker = require('../../support/messageMaker'),
  Crawler = require('simplecrawler');

const make = messageMaker('crawler').make;

const defaultOptions = ({
  maxDepth: 3
});

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.options = merge({}, defaultOptions, options.crawler);
  },
  processMessage(message, queue) {
    if (message.type === 'url' && message.source !== 'crawler') {
      if (this.options.maxDepth <= 1) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const url = urlParser.parse(message.url);
        const crawler = new Crawler(url.hostname, url.path, url.port);

        crawler.maxDepth = this.options.maxDepth;
        crawler.downloadUnsupported = false;
        crawler.supportedMimeTypes = [/text\/html/];

        crawler.on('fetchcomplete', (queueItem) => {
          log.debug('Crawler found URL %s', queueItem.url);
          // FIXME disregard initial url (might have been redirected!)
          queue.postMessage(make('url', {}, {url: queueItem.url}));
        });

        crawler.on('complete', resolve);
        log.info('Start to crawl from ' + message.url + ' with maxDepth ' + crawler.maxDepth);
        crawler.start();
      })
    }
  }
};
