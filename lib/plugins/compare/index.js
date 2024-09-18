import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import intel from 'intel';
import merge from 'lodash.merge';
import get from 'lodash.get';
import dayjs from 'dayjs';

import {
  getStatistics,
  runStatisticalTests,
  getMetrics,
  cliffsDelta,
  getIsSignificant
} from './helper.js';
import { getBaseline, saveBaseline } from './baseline.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const log = intel.getLogger('sitespeedio.plugin.compare');
const defaultConfig = {};

function urlToId(url, options) {
  let id = url
    .replace(/^https?:\/\//, '')
    .replaceAll(/[^\d.A-Za-z]/g, '_')
    .replaceAll(/__+/g, '_')
    .replaceAll(/^_|_$/g, '');

  const connectivityProfile = get(options, 'browsertime.connectivity.profile');

  return `${options.slug ? options.slug + '-' : ''}${
    connectivityProfile ? connectivityProfile + '-' : ''
  }${id}${options.browser ? '-' + options.browser : ''}`;
}

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const DEFAULT_METRICS_PAGESUMMARY = [
  'metrics.timings.*.statisticalTestU',
  'metrics.cpu.*.statisticalTestU',
  'metrics.cdp.*.statisticalTestU',
  'metrics.visualMetrics.*.statisticalTestU',
  'metrics.googleWebVitals.*.statisticalTestU',
  'metrics.renderBlocking.*.statisticalTestU',
  'metrics.elementTimings.*.statisticalTestU',
  'metrics.userTimings.*.statisticalTestU',
  'metrics.extras.*.statisticalTestU',
  'metrics.timings.*.isSignificant',
  'metrics.cpu.*.isSignificant',
  'metrics.cdp.*.isSignificant',
  'metrics.visualMetrics.*.isSignificant',
  'metrics.googleWebVitals.*.isSignificant',
  'metrics.renderBlocking.*.isSignificant',
  'metrics.elementTimings.*.isSignificant',
  'metrics.userTimings.*.isSignificant',
  'metrics.extras.*.isSignificant'
];

export default class ComparePlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'compare', options, context, queue });
  }

  async open(context, options) {
    this.pageXrays = {};
    this.browsertimes = {};
    this.page = 0;
    this.make = context.messageMaker('compare').make;
    this.compareOptions = merge({}, defaultConfig, options.compare);
    this.options = options;
    this.pug = readFileSync(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
    log.info(
      'Starting the compare plugin.' +
        (this.compareOptions.saveBaseline
          ? ' Will save this test as the baseline'
          : '')
    );
    if (options.browsertime.iterations < 20) {
      log.warning(
        'You should use 20+ iterations to get statistical significant data'
      );
    }
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGESUMMARY,
      'compare.pageSummary'
    );
  }
  async processMessage(message) {
    switch (message.type) {
      case 'sitespeedio.setup': {
        super.sendMessage('compare.setup');
        // Add the HTML pugs
        super.sendMessage('html.pug', {
          id: 'compare',
          name: 'Compare',
          pug: this.pug,
          type: 'pageSummary'
        });
        break;
      }
      case 'browsertime.pageSummary': {
        this.browsertimes[message.url] = message;
        break;
      }
      case 'sitespeedio.summarize': {
        for (let url of Object.keys(this.browsertimes)) {
          this.page++;
          const id = this.options.compare.id || urlToId(url, this.options);
          const baseline = await getBaseline(
            id + '-' + this.page,
            this.compareOptions
          );
          if (this.options.compare.id) {
            log.info('Using id %s for page baseline', id);
          } else {
            log.info('Using auto generated id for the baseline: %s ', id);
          }

          if (baseline) {
            if (
              this.options.browsertime.iterations !==
              baseline.browsertime.timestamps.length
            )
              log.warning(
                'The baseline test has %s runs and you current have %s. You should make sure you test the same amount of runs',
                baseline.browsertime.timestamps.length,
                this.options.browsertime.iterations
              );
            log.info('Got a baseline:' + id + '-' + this.page);
            const newMetrics = getMetrics(this.browsertimes[url].data);
            const baselineMetrics = getMetrics(baseline.browsertime);
            const metricsInputData = {
              options: {
                test_type: this.compareOptions.testType,
                alternative: this.compareOptions.alternative
              },
              metrics: {}
            };

            if (this.compareOptions.testType === 'mannwhitneyu') {
              metricsInputData.options.use_continuity =
                this.compareOptions.mannwhitneyu.useContinuity;
              metricsInputData.options.method =
                this.compareOptions.mannwhitneyu.method;
              metricsInputData.options.nan_policy = 'omit';
            } else if (this.compareOptions.testType === 'wilcoxon') {
              metricsInputData.options.correction =
                this.compareOptions.wilcoxon.correction;
              metricsInputData.options.zero_method =
                this.compareOptions.wilcoxon.zeroMethod;
            }

            for (let group in newMetrics) {
              if (baselineMetrics[group]) {
                metricsInputData.metrics[group] = {};
                for (let metricName in newMetrics[group]) {
                  // Ensure both current and baseline metrics are available
                  if (
                    baselineMetrics[group][metricName] &&
                    newMetrics[group][metricName]
                  ) {
                    // Directly access the Metric instance
                    const currentMetric = newMetrics[group][metricName];
                    const baselineMetric = baselineMetrics[group][metricName];

                    // Ensure these are indeed Metric instances
                    const currentStats = getStatistics(
                      currentMetric.getValues()
                    );
                    const baselineStats = getStatistics(
                      baselineMetric.getValues()
                    );
                    metricsInputData.metrics[group][metricName] = {
                      baseline: baselineStats.data,
                      current: currentStats.data
                    };
                  } else {
                    log.info(
                      `Skipping ${group}.${metricName} as it's not present in both current and baseline metrics.`
                    );
                  }
                }
              }
            }

            const results = await runStatisticalTests(metricsInputData);
            const finalResult = {};
            for (let group in results) {
              finalResult[group] = {};
              for (let metricName in results[group]) {
                const result = results[group][metricName];
                // Again, accessing the metricName within the group
                const currentStats = getStatistics(
                  newMetrics[group][metricName].getValues()
                );
                const baselineStats = getStatistics(
                  baselineMetrics[group][metricName].getValues()
                );

                const cliffs = cliffsDelta(
                  currentStats.data,
                  baselineStats.data
                );
                finalResult[group][metricName] = {
                  current: {
                    stdev: currentStats.stddev(),
                    mean: currentStats.amean(),
                    median: currentStats.median(),
                    values: currentStats.data
                  },
                  baseline: {
                    stdev: baselineStats.stddev(),
                    mean: baselineStats.amean(),
                    median: baselineStats.median(),
                    values: baselineStats.data
                  },
                  statisticalTestU: result['p-value'],
                  cliffsDelta: cliffs,
                  isSignificant: getIsSignificant(result['p-value'], cliffs)
                };
              }
            }

            const meta = {
              baseline: {
                timestamp: dayjs(baseline.browsertime.info.timestamp).format(
                  TIME_FORMAT
                ),
                url: baseline.browsertime.info.url,
                alias: baseline.browsertime.info.alias
              },
              current: {
                timestamp: dayjs(
                  this.browsertimes[url].data.info.timestamp
                ).format(TIME_FORMAT),
                url: url,
                alias: this.browsertimes[url].data.info.alias
              },
              testOptions: this.compareOptions,
              iterations: this.options.browsertime.iterations
            };

            const raw = {
              baseline: {
                pagexray: baseline.pagexray,
                browsertime: baseline.browsertime
              },
              current: {
                pagexray: this.pageXrays[url].data,
                browsertime: this.browsertimes[url].data
              }
            };

            if (this.compareOptions.saveBaseline) {
              await saveBaseline(
                {
                  browsertime: this.browsertimes[url].data,
                  pagexray: this.pageXrays[url].data
                },
                path.join(
                  this.compareOptions.baselinePath || process.cwd(),
                  `${id}-${this.page}.json`
                )
              );
            }

            super.sendMessage(
              'compare.pageSummary',
              { metrics: finalResult, meta, raw },
              {
                url: url,
                group: this.browsertimes[url].group,
                runTime: this.browsertimes[url].runTime
              }
            );
          } else {
            if (this.compareOptions.saveBaseline) {
              await saveBaseline(
                {
                  browsertime: this.browsertimes[url].data,
                  pagexray: this.pageXrays[url].data
                },
                path.join(
                  this.compareOptions.baselinePath || process.cwd(),
                  `${id}-${this.page}.json`
                )
              );
            }
          }
        }
        break;
      }
      case 'pagexray.pageSummary': {
        this.pageXrays[message.url] = message;
        break;
      }
    }
  }
}
