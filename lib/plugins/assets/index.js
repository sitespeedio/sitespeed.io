'use strict';

const isEmpty = require('lodash.isempty');
const aggregator = require('./aggregator');
const DEFAULT_METRICS_LARGEST_ASSETS = ['image.0.transferSize'];

module.exports = {
  open(context, options) {
    this.make = context.messageMaker('assets').make;
    this.options = options;
    this.alias = {};
    this.resultUrls = context.resultUrls;
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_LARGEST_ASSETS,
      'largestassets.summary'
    );
    context.filterRegistry.registerFilterForType([], 'slowestassets.summary');
    context.filterRegistry.registerFilterForType([], 'aggregateassets.summary');
    context.filterRegistry.registerFilterForType(
      [],
      'slowestthirdpartyassets.summary'
    );
    context.filterRegistry.registerFilterForType(
      [],
      'largestthirdpartyassets.summary'
    );
  },
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'pagexray.run': {
        aggregator.addToAggregate(
          message.data,
          message.group,
          message.url,
          this.resultUrls,
          message.runIndex,
          this.options,
          this.alias
        );
        break;
      }

      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }
      case 'sitespeedio.summarize': {
        const summary = aggregator.summarize();
        if (!isEmpty(summary)) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(
              make('aggregateassets.summary', summary.groups[group], {
                group
              })
            );

            queue.postMessage(
              make('largestassets.summary', summary.size[group], { group })
            );

            queue.postMessage(
              make('slowestassets.summary', summary.timing[group], {
                group
              })
            );
          }

          if (this.options.firstParty) {
            queue.postMessage(
              make(
                'slowestthirdpartyassets.summary',
                summary.timing.thirdParty,
                {
                  group: 'total'
                }
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
