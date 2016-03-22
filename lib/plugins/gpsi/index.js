'use strict';

var Promise = require('bluebird'),
  path = require('path'),
  throwIfMissing = require('../../support/util').throwIfMissing,
  messageMaker = require('../../support/messageMaker'),
  aggregator = require('./aggregator'),
  analyzer = require('./analyzer');

const make = messageMaker('gpsi').make;

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    throwIfMissing(options.gpsi, ['key'], 'gpsi');

    this.options = options || {};
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'url':
      {
        const url = message.url;
        return analyzer.analyzeUrl(url, this.options.gpsi)
          .then((result) => queue.postMessage(make('gpsi.data', result, {url})));
      }

      case 'gpsi.data':
        return Promise.all([
          aggregator.speedAggregator.addToAggregate(message.data),
          aggregator.pageSummaryAggregator.addToAggregate(message.data)
        ]);

      case 'summarize':
      {
        queue.postMessage(make('gpsi.speed', aggregator.speedAggregator.summarize()));
        queue.postMessage(make('gpsi.pageSummary', aggregator.pageSummaryAggregator.summarize()));
      }
    }
  }
};
