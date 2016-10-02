'use strict';

let path = require('path'),
  messageMaker = require('../../support/messageMaker'),
  filterRegistry = require('../../support/filterRegistry'),
  isEmpty = require('lodash.isempty'),
  aggregator = require('./aggregator');

const make = messageMaker('domains').make;

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open() {
    // '*.requestCounts, 'domains.summary'
    filterRegistry.registerFilterForType([],'domains.summary');
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'browsertime.har':
      {
        aggregator.addToAggregate(message.data);
        break;
      }

      case 'summarize':
      {
        const summary = aggregator.summarize();
        if (!isEmpty(summary)) {
          queue.postMessage(make('domains.summary', summary));
        }
        break;
      }
    }
  }
};
