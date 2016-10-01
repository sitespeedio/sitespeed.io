'use strict';

let messageMaker = require('../../support/messageMaker'),
  path = require('path'),
  isEmpty = require('lodash.isempty'),
  aggregator = require('./aggregator');

const make = messageMaker('assets').make;

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context) {
    this.context = context;
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'pagexray.run':
      {
        aggregator.addToAggregate(message.data, message.group, message.url, this.context.storageManager);
        break;
      }

      case 'summarize':
      {
        const summary = aggregator.summarize();
        if (!isEmpty(summary)) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(make('assets.aggregate', summary.groups[group], {group}));

            for (let contentType of Object.keys(summary.size[group])) {
              queue.postMessage(make('assets.aggregateSizePerContentType', summary.size[group][contentType], {group, contentType}));
            }

            queue.postMessage(make('assets.slowest', summary.timing[group], {group}));
          }

          for (let contentType of Object.keys(summary.size.total)) {
            queue.postMessage(make('assets.aggregateSizePerContentType', summary.size.total[contentType], {contentType}));
          }

          queue.postMessage(make('assets.slowest', summary.timing.total));
        }
        break;
      }
    }
  }
};
