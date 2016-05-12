'use strict';

const browsertime = require('browsertime'),
  Promise = require('bluebird'),
  path = require('path'),
  urlParser = require('url'),
  messageMaker = require('../../support/messageMaker'),
  filterRegistry = require('../../support/filterRegistry'),
  api = require('webcoach'),
  log = require('intel'),
  BrowserError = browsertime.errors.BrowserError,
  analyzer = require('./analyzer'),
  isNotEmpty = require('../../support/util').isNotEmpty;

function removeHash(url) {
  const parsedUrl = urlParser.parse(url);
  parsedUrl.hash = null;
  return urlParser.format(parsedUrl);
}

function parseDomain(url) {
  return urlParser.parse(url).hostname;
}

const make = messageMaker('browsertime').make;

const visitedUrls = new Set();

const maxDepth = 1;

const DEFAULT_METRICS = [
  'performance.firstPaint',
  'performance.rumSpeedIndex'];

module.exports = {
  concurrency: 1,
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.options = options;

    if (!this.options.browsertime) {
      this.options.browsertime = {};
    }

    browsertime.logging.configure(options);

    filterRegistry.registerFilterForType(DEFAULT_METRICS, 'browsertime.run');
  },
  processMessage(message, queue) {
    function processCrawlOutput(url, results) {
      const originalDomain = parseDomain(url);

      let depth = message.data.depth || 0;

      if (depth < maxDepth) {
        depth += 1;
        const links = results.browserScripts[0].crawler.links;

        for (let link of links) {
          link = removeHash(link);
          const domain = parseDomain(link);

          if (!visitedUrls.has(link) && domain === originalDomain) {
            visitedUrls.add(link);
            queue.postMessage(make('url', {depth, referrer: url}, {url: link}));
          }
        }
      }
    }

    function processCoachOutput(url, results) {
      return Promise.resolve(results.browserScripts)
        .each((run, runIndex) => {
          const coachAdvice = run.coach.coachAdvice;

          // check if the coach has error(s)
          if (isNotEmpty(coachAdvice.errors)) {
            log.error('%s generated the following errors in the coach %:2j', url, coachAdvice.errors);
            queue.postMessage(make('error', 'The coach got the following errors: ' + JSON.stringify(coachAdvice.errors),
              {url, runIndex}));
          }

          // make sure to get the right run in the HAR
          const myHar = api.pickAPage(results.har, runIndex);

          return api.runHarAdvice(myHar)
            .then((harResult) => api.merge(coachAdvice, harResult))
            .then((total) => queue.postMessage(make('coach.run', total, {url, runIndex})));
        });
    }

    switch (message.type) {
      case 'url':
      {
        const url = message.url;

        visitedUrls.add(url);
        return analyzer.analyzeUrl(url, this.options)
          .tap((results) => {
            log.trace('Result from Browsertime for %s with %:2j', url, results);
            if (this.options.browsertime.crawl) {
              processCrawlOutput(url, results);
            }
          })
          .tap((results) => {
            if (this.options.browsertime.coach) {
              return processCoachOutput(url, results);
            }
          })
          .tap((results) => {
            results.browserScripts.forEach((run, runIndex) => {
              queue.postMessage(make('browsertime.run', run, {url, runIndex}));
            });
            queue.postMessage(make('browsertime.page', results, {url}));
          })
          .tap((results) => {
            if (results.har) {
              queue.postMessage(make('browsertime.har', results.har, {url}));
            }
          })
          .catch(BrowserError, (err) => {
            queue.postMessage(make('error', err.message, err.extra));
          });
      }
    }
  }
};
