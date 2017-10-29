'use strict';
const aggregator = require('./aggregator');
const pagexrayAggregator = require('./pagexrayAggregator');
const pagexray = require('pagexray');

const DEFAULT_METRICS_SUMMARY = [
  'score.*',
  'performance.score.*',
  'bestpractice.score.*',
  'accessibility.score.*'
];
const DEFAULT_METRICS_PAGESUMMARY = [
  'advice.score',
  'advice.performance.score',
  'advice.bestpractice.score',
  'advice.accessibility.score',
  'advice.info.documentHeight',
  'advice.info.domElements',
  'advice.info.domDepth',
  'advice.info.iframes',
  'advice.info.scripts',
  'advice.info.localStorageSize'
];
const DEFAULT_PAGEXRAY_PAGESUMMARY_METRICS = [
  'contentTypes',
  'transferSize',
  'contentSize',
  'requests',
  'firstParty',
  'thirdParty',
  'responseCodes',
  'expireStats',
  'totalDomains',
  'lastModifiedStats',
  'cookieStats'
];
const DEFAULT_PAGEXRAY_SUMMARY_METRICS = [
  'contentTypes',
  'transferSize',
  'contentSize',
  'requests',
  'firstParty',
  'thirdParty',
  'responseCodes',
  'expireStats',
  'domains',
  'lastModifiedStats',
  'cookieStats'
];

module.exports = {
  open(context, options) {
    this.options = options;
    this.make = context.messageMaker('coach').make;

    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_SUMMARY,
      'coach.summary'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGESUMMARY,
      'coach.pageSummary'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_PAGEXRAY_PAGESUMMARY_METRICS,
      'pagexray.pageSummary'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_PAGEXRAY_SUMMARY_METRICS,
      'pagexray.summary'
    );
  },
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'sitespeedio.setup': {
        queue.postMessage(make('browsertime.config', { coach: true }));
        break;
      }
      case 'coach.run': {
        if (message.runIndex === 0) {
          // For now, choose the first run to represent the whole page.
          // Later we might want to change the median run (based on some metric) similar to the WPT approach.
          const url = message.url;
          const group = message.group;
          queue.postMessage(
            make('coach.pageSummary', message.data, { url, group })
          );
        }

        aggregator.addToAggregate(message.data, message.group);
        break;
      }

      case 'browsertime.har': {
        const url = message.url;
        const group = message.group;
        let config = {
          includeAssets: true,
          firstParty: this.options.firstParty
            ? this.options.firstParty
            : undefined
        };
        const pageSummary = pagexray.convert(message.data, config);

        pagexrayAggregator.addToAggregate(pageSummary, group);

        queue.postMessage(
          make('pagexray.pageSummary', pageSummary[0], { url, group })
        );

        pageSummary.forEach((run, runIndex) => {
          queue.postMessage(
            make('pagexray.run', run, { url, group, runIndex })
          );
        });
        break;
      }

      case 'sitespeedio.summarize': {
        let summary = aggregator.summarize();
        if (summary) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(
              make('coach.summary', summary.groups[group], { group })
            );
          }
        }

        let pagexraySummary = pagexrayAggregator.summarize();
        if (pagexraySummary) {
          for (let group of Object.keys(pagexraySummary.groups)) {
            queue.postMessage(
              make('pagexray.summary', pagexraySummary.groups[group], { group })
            );
          }
        }
        break;
      }
    }
  }
};
