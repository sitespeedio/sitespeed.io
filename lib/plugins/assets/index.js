'use strict';

let messageMaker = require('../../support/messageMaker'),
  path = require('path'),
  isNotEmpty = require('../../support/util').isNotEmpty,
  aggregator = require('./aggregator');

const make = messageMaker('assets').make;

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'pagexray.run':
      {
        aggregator.addToAggregate(message.data);
        break;
      }

      case 'summarize':
      {
        const summary = aggregator.summarize();
        if (isNotEmpty(summary)) {
          queue.postMessage(make('assets.aggregate', summary));
        }
        break;
      }
    }
  }
};
