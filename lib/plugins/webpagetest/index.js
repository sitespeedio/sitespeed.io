'use strict';

let throwIfMissing = require('../../support/util').throwIfMissing,
  path = require('path'),
  urlParser = require('url'),
  messageMaker = require('../../support/messageMaker'),
  filterRegistry = require('../../support/filterRegistry'),
  analyzer = require('./analyzer'),
  aggregator = require('./aggregator'),
  forEach = require('lodash.foreach'),
  WebPageTest = require('webpagetest');

const make = messageMaker('webpagetest').make;

const hostRegex = /^(https?:\/\/)?([^\/]*)/i;
const defaultWptHost = urlParser.parse(WebPageTest.defaultServer).host;

const DEFAULT_METRICS = [
  'data.median.*.SpeedIndex',
  'data.median.*.render',
  'data.median.*.TTFB',
  'data.median.*.fullyLoaded'];

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    throwIfMissing(options.webpagetest, ['host'], 'webpagetest');

    if (!options.webpagetest.key) {
      const host = hostRegex.exec(options.webpagetest.host);
      if (host && host[2] === defaultWptHost) {
        throw new Error('webpagetest.key needs to be specified when using the public WebPageTest server.');
      }
    }

    this.options = options;

    filterRegistry.registerFilterForType(DEFAULT_METRICS, 'webpagetest.pageSummary');
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'url':
      {
        const url = message.url;
        return analyzer.analyzeUrl(url, this.options)
          .tap((result) => {
            queue.postMessage(make('webpagetest.har', result.har, {url}));

            forEach(result.data.runs, (run, runKey) =>
              queue.postMessage(make('webpagetest.run', run, {
                url,
                runIndex: (parseInt(runKey) - 1)
              }))
            );
            const location = result.data.location.replace(':', '-').replace(' ', '-').toLowerCase();
            const connectivity = result.data.connectivity.toLowerCase();
            queue.postMessage(make('webpagetest.pageSummary', result, {url, location, connectivity}));
            aggregator.addToAggregate(result, connectivity, location);
          })
          .catch((err) => {
            queue.postMessage(make('error', err, {url}));
          })
      }

      case 'summarize':
      {
        let summary = aggregator.summarize();
        if (summary && Object.keys(summary).length > 0) {
          queue.postMessage(make('webpagetest.summary', summary, {connectivity: aggregator.connectivity, location: aggregator.location}));
        }
      }
    }
  }
};
