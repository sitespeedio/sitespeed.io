'use strict';

var Promise = require('bluebird'),
  path = require('path'),
  messageMaker = require('../../support/messageMaker'),
  aggregator = require('./aggregator'),
  log = require('intel'),
  filterRegistry = require('../../support/filterRegistry'),
  analyzer = require('./analyzer');

const make = messageMaker('gpsi').make;
const DEFAULT_METRICS_PAGESUMMARY = ['ruleGroups.SPEED.score'];

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.options = options;
    filterRegistry.registerFilterForType(DEFAULT_METRICS_PAGESUMMARY, 'gpsi.pageSummary');
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'url':
        {
          const url = message.url;
          return analyzer.analyzeUrl(url, this.options.gpsi)
            .then((result) => {
              log.info('Got ' + url + ' analysed from Google Page Speed Insights');
              log.trace('Result from Google Page Speed Insights:%:2j', result);
              queue.postMessage(make('gpsi.pageSummary', result, {
                url
              }))
            });
        }

      case 'gpsi.data':
        return Promise.all([
          aggregator.speedAggregator.addToAggregate(message.data),
          aggregator.pageStatsAggregator.addToAggregate(message.data)
        ]);

      case 'summarize':
        {
          // TODO lets implement the summary later, most important is to
          // get the score per page
          // queue.postMessage(make('gpsi.speed', aggregator.speedAggregator.summarize()));
          // queue.postMessage(make('gpsi.summary', aggregator.pageStatsAggregator.summarize()));
        }
    }
  }
};
