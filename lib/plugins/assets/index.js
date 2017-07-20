'use strict';

const messageMaker = require('../../support/messageMaker');
const isEmpty = require('lodash.isempty');
const filterRegistry = require('../../support/filterRegistry');
const aggregator = require('./aggregator');

const make = messageMaker('assets').make;

const DEFAULT_METRICS_LARGEST_ASSETS = ['image.0.transferSize'];

module.exports = {
  open(context, options) {
    this.options = options;
    this.resultUrls = context.resultUrls;
    filterRegistry.registerFilterForType(
      DEFAULT_METRICS_LARGEST_ASSETS,
      'largestassets.summary'
    );
    filterRegistry.registerFilterForType([], 'slowestassets.summary');
    filterRegistry.registerFilterForType([], 'aggregateassets.summary');
    filterRegistry.registerFilterForType([], 'slowestthirdpartyassets.summary');
    filterRegistry.registerFilterForType([], 'largestthirdpartyassets.summary');
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'pagexray.run': {
        aggregator.addToAggregate(
          message.data,
          message.group,
          message.url,
          this.resultUrls,
          message.runIndex,
          this.options
        );
        break;
      }

      case 'summarize': {
        const summary = aggregator.summarize();
        if (!isEmpty(summary)) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(
              make('aggregateassets.summary', summary.groups[group], { group })
            );

            for (let contentType of Object.keys(summary.size[group])) {
              const d = {};
              d[contentType] = summary.size[group][contentType];
              queue.postMessage(make('largestassets.summary', d, { group }));
            }

            queue.postMessage(
              make('slowestassets.summary', summary.timing[group], { group })
            );
          }

          for (let contentType of Object.keys(summary.size.total)) {
            queue.postMessage(
              make('largestassets.summary', summary.size.total[contentType], {
                group: 'total'
              })
            );
          }

          queue.postMessage(
            make('slowestassets.summary', summary.timing.total, {
              group: 'total'
            })
          );

          if (this.options.firstParty) {
            queue.postMessage(
              make(
                'slowestthirdpartyassets.summary',
                summary.timing.thirdParty,
                { group: 'total' }
              )
            );
            queue.postMessage(
              make('largestthirdpartyassets.summary', summary.size.thirdParty, {
                group: 'total'
              })
            );
          }
        }
        break;
      }
    }
  }
};
