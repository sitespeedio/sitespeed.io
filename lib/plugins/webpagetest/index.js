'use strict';

const urlParser = require('url');
const analyzer = require('./analyzer');
const aggregator = require('./aggregator');
const forEach = require('lodash.foreach');
const merge = require('lodash.merge');
const get = require('lodash.get');
const log = require('intel').getLogger('sitespeedio.plugin.webpagetest');
const WebPageTest = require('webpagetest');

const DEFAULT_PAGE_SUMMARY_METRICS = [
  'data.median.*.SpeedIndex',
  'data.median.*.render',
  'data.median.*.TTFB',
  'data.median.*.loadTime',
  'data.median.*.fullyLoaded',
  'data.median.*.userTimes.*',
  // Use bytesIn to collect data for Opera Mini & UC Mini
  'data.median.*.bytesIn',
  'data.median.*.breakdown.*.requests',
  'data.median.*.breakdown.*.bytes',
  'data.median.*.requestsFull'
];

const DEFAULT_SUMMARY_METRICS = [
  'timing.*.SpeedIndex',
  'timing.*.render',
  'timing.*.TTFB',
  'timing.*.fullyLoaded',
  'asset.*.breakdown.*.requests',
  'asset.*.breakdown.*.bytes',
  'custom.*.custom.*'
];

function addCustomMetric(result, filterRegistry) {
  const customMetrics = get(result, 'data.median.firstView.custom');
  if (customMetrics) {
    for (const customMetric of customMetrics) {
      filterRegistry.addFilterForType(
        'data.median.*.' + customMetric,
        'webpagetest.pageSummary'
      );
    }
  }
}

const defaultConfig = {
  host: WebPageTest.defaultServer,
  location: 'Dulles:Chrome',
  connectivity: 'Cable',
  runs: 3,
  pollResults: 10,
  timeout: 600,
  includeRepeatView: false,
  private: true,
  aftRenderingTime: true,
  video: true
};

function isPublicWptHost(address) {
  const host = /^(https?:\/\/)?([^/]*)/i.exec(address);
  return host && host[2] === urlParser.parse(WebPageTest.defaultServer).host;
}

module.exports = {
  open(context, options) {
    this.make = context.messageMaker('webpagetest').make;
    this.options = merge({}, defaultConfig, options.webpagetest);
    this.storageManager = context.storageManager;
    this.filterRegistry = context.filterRegistry;
    if (!this.options.key && isPublicWptHost(this.options.host)) {
      throw new Error(
        'webpagetest.key needs to be specified when using the public WebPageTest server.'
      );
    }

    context.filterRegistry.registerFilterForType(
      DEFAULT_PAGE_SUMMARY_METRICS,
      'webpagetest.pageSummary'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_SUMMARY_METRICS,
      'webpagetest.summary'
    );
  },
  processMessage(message, queue) {
    const filterRegistry = this.filterRegistry;
    const make = this.make;
    const wptOptions = this.options;
    switch (message.type) {
      case 'url': {
        const url = message.url;
        const group = message.group;
        return analyzer
          .analyzeUrl(url, this.storageManager, wptOptions)
          .tap(result => {
            addCustomMetric(result, filterRegistry);
            if (result.trace) {
              forEach(result.trace, (value, key) => {
                queue.postMessage(
                  make('webpagetest.chrometrace', value, {
                    url,
                    group,
                    name: key + '.json'
                  })
                );
              });
            }

            queue.postMessage(
              make('webpagetest.har', result.har, { url, group })
            );
            forEach(result.data.runs, (run, runKey) =>
              queue.postMessage(
                make('webpagetest.run', run, {
                  url,
                  group,
                  runIndex: parseInt(runKey) - 1
                })
              )
            );
            const location = result.data.location
              .replace(':', '-')
              .replace(' ', '-')
              .toLowerCase();
            // There's no connectivity setup in the default config for WPT, make sure we catch that
            const connectivity = get(
              result,
              'data.connectivity',
              'native'
            ).toLowerCase();
            queue.postMessage(
              make('webpagetest.pageSummary', result, {
                url,
                group,
                location,
                connectivity
              })
            );
            aggregator.addToAggregate(
              group,
              result,
              connectivity,
              location,
              wptOptions
            );
          })
          .catch(err => {
            log.error('Error creating WebPageTest result ', err);
            queue.postMessage(
              make('error', err, {
                url
              })
            );
          });
      }

      case 'sitespeedio.summarize': {
        let summary = aggregator.summarize();
        if (summary && Object.keys(summary.groups).length > 0) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(
              make('webpagetest.summary', summary.groups[group], {
                connectivity: aggregator.connectivity,
                location: aggregator.location,
                group
              })
            );
          }
        }
      }
    }
  },
  config: defaultConfig
};
