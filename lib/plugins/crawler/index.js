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
        const redirectedUrls = new Set(),
          url = urlParser.parse(message.url),
          crawler = new Crawler(url.hostname, url.path, url.port);

        if (url.protocol) {
          // Node's url parser includes a : at the end of protocol, simplecrawler expects no :.
          crawler.initialProtocol = url.protocol.slice(0, -1);
        }

        crawler.maxDepth = this.options.maxDepth;
        crawler.downloadUnsupported = false;
        crawler.allowInitialDomainChange = true;
        crawler.addFetchCondition(function(parsedURL) {
          const extension = path.extname(parsedURL.path);
          // Don't try to download these, based on file name.
          return ['png', 'jpg', 'gif', 'pdf'].indexOf(extension) === -1;
        });

        crawler.on('fetchredirect', (queueItem, parsedURL, response) => {
          redirectedUrls.add(response.headers.location);
        });

        crawler.on('fetchcomplete', (queueItem) => {
          const url = queueItem.url;
          if (redirectedUrls.has(url)) {
            log.verbose('Crawler skipping redirected URL %s', url);
          } else {
            log.verbose('Crawler found URL %s', url);
            queue.postMessage(make('url', {}, { url }));
          }
        });

        crawler.on('complete', resolve);

        log.debug('Starting to crawl from ' + message.url + ' with max depth ' + crawler.maxDepth);
        crawler.start();
      })
    }
  }
};
