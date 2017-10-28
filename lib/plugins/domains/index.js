'use strict';

const messageMaker = require('../../support/messageMaker');
const filterRegistry = require('../../support/filterRegistry');
const isEmpty = require('lodash.isempty');
const aggregator = require('./aggregator');

const make = messageMaker('domains').make;

module.exports = {
  open() {
    // '*.requestCounts, 'domains.summary'
    filterRegistry.registerFilterForType([], 'domains.summary');
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'browsertime.har': {
        aggregator.addToAggregate(message.data, message.url);
        break;
      }

      case 'sitespeedio.summarize': {
        const summary = aggregator.summarize();
        if (!isEmpty(summary)) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(
              make('domains.summary', summary.groups[group], { group })
            );
          }
        }
        break;
      }
    }
  }
};
