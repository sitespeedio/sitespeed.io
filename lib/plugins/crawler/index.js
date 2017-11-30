'use strict';

const Promise = require('bluebird');
const path = require('path');
const merge = require('lodash.merge');
const log = require('intel').getLogger('sitespeedio.plugin.crawler');
const Crawler = require('simplecrawler');

const defaultOptions = {
  depth: 3
};

module.exports = {
  open(context, options) {
    this.options = merge({}, defaultOptions, options.crawler);
    this.make = context.messageMaker('crawler').make;
    this.basicAuth = options.browsertime
      ? options.browsertime.basicAuth
      : undefined;
  },
  processMessage(message, queue) {
    const make = this.make;
    if (message.type === 'url' && message.source !== 'crawler') {
      const maxPages = this.options.maxPages || Number.MAX_SAFE_INTEGER;

      if (this.options.depth <= 1 || maxPages === 1) {
        return Promise.resolve();
      }

      return new Promise(resolve => {
        const redirectedUrls = new Set(),
          crawler = new Crawler(message.url);

        let pageCount = 1; // First page is start url

        crawler.maxDepth = this.options.depth;
        crawler.downloadUnsupported = false;
        crawler.allowInitialDomainChange = true;
        crawler.parseHTMLComments = false;
        crawler.addFetchCondition(function(parsedURL) {
          const extension = path.extname(parsedURL.path);
          // Don't try to download these, based on file name.
          return ['png', 'jpg', 'gif', 'pdf'].indexOf(extension) === -1;
        });

        if (this.basicAuth) {
          const userAndPassword = this.basicAuth.split('@');
          crawler.needsAuth = true;
          crawler.authUser = userAndPassword[0];
          crawler.authPass = userAndPassword[1];
        }

        crawler.on('fetchredirect', (queueItem, parsedURL, response) => {
          redirectedUrls.add(response.headers.location);
        });

        crawler.on('fetchcomplete', queueItem => {
          const pageMimeType = /^(text|application)\/x?html/i;

          const url = queueItem.url;
          if (redirectedUrls.has(url)) {
            log.verbose('Crawler skipping redirected URL %s', url);
          } else if (message.url === url) {
            log.verbose('Crawler skipping initial URL %s', url);
          } else if (pageMimeType.test(queueItem.stateData.contentType)) {
            log.verbose('Crawler found %s URL %s', pageCount, url);
            queue.postMessage(make('url', {}, { url, group: message.group }));
            pageCount++;

            if (pageCount >= maxPages) {
              log.info('Crawler stopped after %d urls', pageCount);
              crawler.stop();
              return resolve();
            }
          } else {
            log.verbose('Crawler found non html URL %s', url);
          }
        });

        crawler.on('complete', resolve);

        log.info(
          'Starting to crawl from ' +
            message.url +
            ' with max depth ' +
            crawler.maxDepth +
            ' and max count ' +
            maxPages
        );
        crawler.start();
      });
    }
  }
};
