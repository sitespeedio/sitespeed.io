'use strict';

let path = require('path'),
  messageMaker = require('../../support/messageMaker'),
  filterRegistry = require('../../support/filterRegistry'),
  aggregator = require('./aggregator');

const make = messageMaker('domains').make;

module.exports = {
  name() { return path.basename(__dirname); },
  open() {
  filterRegistry.registerFilterForType([''], 'domains.summary');
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
        if (summary.length > 0) {
          queue.postMessage(make('domains.summary', summary));
        }
        break;
      }
    }
  }
};
