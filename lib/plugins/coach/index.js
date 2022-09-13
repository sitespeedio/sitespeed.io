'use strict';
const aggregator = require('./aggregator');
const log = require('intel').getLogger('plugin.coach');

const DEFAULT_METRICS_RUN = [];

const DEFAULT_METRICS_SUMMARY = [
  'score.*',
  'performance.score.*',
  'privacy.score.*',
  'bestpractice.score.*',
  'accessibility.score.*'
];
const DEFAULT_METRICS_PAGESUMMARY = [
  'advice.score',
  'advice.performance.score',
  'advice.privacy.score',
  'advice.bestpractice.score',
  'advice.info.documentHeight',
  'advice.info.domElements',
  'advice.info.domDepth',
  'advice.info.iframes',
  'advice.info.scripts',
  'advice.info.localStorageSize'
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
      DEFAULT_METRICS_RUN,
      'coach.run'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGESUMMARY,
      'coach.pageSummary'
    );
  },
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'browsertime.setup': {
        queue.postMessage(make('browsertime.config', { coach: true }));
        break;
      }
      case 'coach.run': {
        if (message.iteration === 1) {
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

      case 'sitespeedio.summarize': {
        log.debug('Generate summary metrics from the Coach');
        let summary = aggregator.summarize();
        if (summary) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(
              make('coach.summary', summary.groups[group], { group })
            );
          }
        }
        break;
      }
    }
  }
};
