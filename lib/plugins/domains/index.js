'use strict';
const isEmpty = require('lodash.isempty');
const aggregator = require('./aggregator');

module.exports = {
  open(context) {
    this.make = context.messageMaker('domains').make;
    // '*.requestCounts, 'domains.summary'
    context.filterRegistry.registerFilterForType([], 'domains.summary');
    this.browsertime = false;
  },
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'browsertime.setup': {
        this.browsertime = true;
        break;
      }

      case 'browsertime.har': {
        aggregator.addToAggregate(message.data, message.url);
        break;
      }

      case 'webpagetest.har': {
        // Only collect WebPageTest data if we don't run Browsertime
        if (this.browsertime === false) {
          aggregator.addToAggregate(message.data, message.url);
        }
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
