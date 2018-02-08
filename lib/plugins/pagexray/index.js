'use strict';
const pagexrayAggregator = require('./pagexrayAggregator');
const pagexray = require('pagexray');
const log = require('intel').getLogger('plugin.pagexray');

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
    this.make = context.messageMaker('pagexray').make;

    context.filterRegistry.registerFilterForType(
      DEFAULT_PAGEXRAY_PAGESUMMARY_METRICS,
      'pagexray.pageSummary'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_PAGEXRAY_SUMMARY_METRICS,
      'pagexray.summary'
    );

    this.usingWebpagetest = false;
    this.usingBrowsertime = false;
  },
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'browsertime.setup': {
        this.usingBrowsertime = true;
        break;
      }
      case 'webpagetest.setup': {
        this.usingWebpagetest = true;
        break;
      }
      case 'webpagetest.har':
      case 'browsertime.har': {
        if (
          this.usingBrowsertime ||
          (!this.usingBrowsertime && this.usingWebpagetest)
        ) {
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
        }
        break;
      }

      case 'sitespeedio.summarize': {
        log.debug('Generate summary metrics from PageXray');
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
