'use strict';

let messageMaker = require('../../support/messageMaker'),
  path = require('path'),
  isEmpty = require('lodash.isempty'),
  filterRegistry = require('../../support/filterRegistry'),
  aggregator = require('./aggregator');

const make = messageMaker('assets').make;

const DEFAULT_METRICS_LARGEST_ASSETS = [
  'total.image.0.transferSize'
];

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context) {
    this.context = context;
    filterRegistry.registerFilterForType(DEFAULT_METRICS_LARGEST_ASSETS, 'assets.largest');
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
            const data = {};
            data[group] = summary.groups[group];
            queue.postMessage(make('assets.aggregate', data));

            for (let contentType of Object.keys(summary.size[group])) {
              const d = {};
              d[group] = {};
              d[group][contentType] = summary.size[group][contentType];
              queue.postMessage(make('assets.largest', d));
            }
            const slow = {};
            slow[group] = summary.timing[group];
            queue.postMessage(make('assets.slowest', slow));
          }

          for (let contentType of Object.keys(summary.size.total)) {
            const data = {};
            data[contentType] = summary.size.total[contentType];
            queue.postMessage(make('assets.largest', contentType));
          }

          queue.postMessage(make('assets.slowest', summary.timing.total));
        }
        break;
      }
    }
  }
};
