'use strict';

let path = require('path'),
  messageMaker = require('../../support/messageMaker'),
  aggregator = require('./aggregator'),
  pagexrayAggregator = require('./pagexrayAggregator'),
  pagexray = require('pagexray'),
  filterRegistry = require('../../support/filterRegistry');

const make = messageMaker('coach').make;

const DEFAULT_METRICS_SUMMARY = ['score.*','performance.score.*', 'bestpractice.score.*', 'accessibility.score.*'];
const DEFAULT_METRICS_PAGESUMMARY = ['advice.score','advice.performance.score','advice.bestpractice.score', 'advice.accessibility.score'];
const DEFAULT_PAGEXRAY_PAGESUMMARY_METRICS = ['contentTypes','transferSize','contentSize','requests'];

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open() {
    filterRegistry.registerFilterForType(DEFAULT_METRICS_SUMMARY, 'coach.summary');
    filterRegistry.registerFilterForType(DEFAULT_METRICS_PAGESUMMARY, 'coach.pageSummary');
    filterRegistry.registerFilterForType(DEFAULT_PAGEXRAY_PAGESUMMARY_METRICS, 'pagexray.pageSummary');
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'coach.run':
      {
        if (message.runIndex === 0) {
          // For now, choose the first run to represent the whole page.
          // Later we might want to change the median run (based on some metric) similar to the WPT approach.
          const url = message.url;
          queue.postMessage(make('coach.pageSummary', message.data, {url}));
        }

        aggregator.addToAggregate(message.data);
        break;
      }

      case 'browsertime.har':
      {
        const url = message.url;
        const pageSummary = pagexray.convert(message.data, {
          includeAssets: true
        });

        pagexrayAggregator.addToAggregate(pageSummary, message.url);

        queue.postMessage(make('pagexray.pageSummary', pageSummary[0], {url}));

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
