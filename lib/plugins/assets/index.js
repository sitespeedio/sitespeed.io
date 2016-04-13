'use strict';

let messageMaker = require('../../support/messageMaker'),
  path = require('path'),
  aggregator = require('./aggregator');

const make = messageMaker('assets').make;

module.exports = {
  name() { return path.basename(__dirname); },
  processMessage(message, queue) {
    switch (message.type) {
      case 'snufkin.run':
      {
        aggregator.addToAggregate(message.data);
        break;
      }

      case 'summarize':
      {
        const summary = aggregator.summarize();
        if (summary && Object.keys(summary).length > 0) {
          queue.postMessage(make('assets.aggregate', summary));
        }
        break;
      }
    }
  }
};
