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
        aggregator.addToAggregate(message.data, message.data.url);
        break;
      }

      case 'summarize':
      {
        const summary = aggregator.summarize();
        if (isNotEmpty(summary)) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(make('assets.aggregate', summary.groups[group], {group}));
          }
        }
        break;
      }
    }
  }
};
