'use strict';

var path = require('path'),
  messageMaker = require('../../support/messageMaker'),
  analyzer = require('./analyzer'),
  aggregator = require('./aggregator');

const make = messageMaker('yslow').make;

module.exports = {
  concurrency: 1,
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.storageManager = context.storageManager;
    this.options = options || {};
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'url':
      {
        const url = message.url;
        return this.storageManager.createDataDirForUrl(url)
          .then((resultDir) => analyzer.analyzeUrl(url, resultDir, this.options.yslow))
          .then((result) => queue.postMessage(make('yslow.data', result, {url})));
      }

      case 'yslow.data':
        return aggregator.addToAggregate(message.data);

      case 'summarize':
      {
        let summary = aggregator.summarize();
        if (summary && Object.keys(summary).length > 0) {
          queue.postMessage(make('yslow.stats', summary));
        }
      }
    }
  }
};
