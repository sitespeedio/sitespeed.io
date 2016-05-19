'use strict';

var Promise = require('bluebird'),
  path = require('path'),
  messageMaker = require('../../support/messageMaker'),
  aggregator = require('./aggregator'),
  log = require('intel'),
  analyzer = require('./analyzer');

const make = messageMaker('gpsi').make;

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.options = options;
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
              queue.postMessage(make('gpsi.data', result, {
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
          queue.postMessage(make('gpsi.speed', aggregator.speedAggregator.summarize()));
          queue.postMessage(make('gpsi.summary', aggregator.pageStatsAggregator.summarize()));
        }
    }
  }
};
