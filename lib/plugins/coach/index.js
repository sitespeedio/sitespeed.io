'use strict';

let path = require('path'),
  messageMaker = require('../../support/messageMaker'),
  aggregator = require('./aggregator'),
  pagexrayAggregator = require('./pagexrayAggregator'),
  pagexray = require('pagexray'),
  filterRegistry = require('../../support/filterRegistry');

const make = messageMaker('coach').make;

const DEFAULT_METRICS = ['performance.score.*', 'bestpractice.score.*', 'accessibility.score.*'];

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open() {
    filterRegistry.registerFilterForType(DEFAULT_METRICS, 'coach.summary');
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'coach.run':
      {
        aggregator.addToAggregate(message.data, message.url);
        break;
      }

      case 'browsertime.har':
      {
        const url = message.url;
        const pageSummary = pagexray.convert(message.data, {
          includeAssets: true
        });

        pagexrayAggregator.addToAggregate(pageSummary, message.url);

        queue.postMessage(make('pagexray.pageSummary', pageSummary, {url}));

        pageSummary.forEach((run, runIndex) => {
          queue.postMessage(make('pagexray.run', run, {url, runIndex}));
        });
        break;
      }

      case 'summarize':
      {
        let summary = aggregator.summarize();
        if (summary && Object.keys(summary).length > 0) {
          queue.postMessage(make('coach.summary', summary));
        }

        let pagexraySummary = pagexrayAggregator.summarize();
        if (pagexraySummary && Object.keys(pagexraySummary).length > 0) {
          queue.postMessage(make('pagexray.summary', pagexraySummary));
        }
        break;
      }
    }
  }
};
