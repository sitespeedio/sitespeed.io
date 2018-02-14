'use strict';

const browsertime = require('browsertime');
const Promise = require('bluebird');
const aggregator = require('./aggregator');
const api = require('webcoach');
const forEach = require('lodash.foreach');
const log = require('intel').getLogger('plugin.browsertime');
const merge = require('lodash.merge');
const BrowsertimeError = browsertime.errors.BrowsertimeError;
const analyzer = require('./analyzer');
const moment = require('moment');
const isEmpty = require('lodash.isempty');
const get = require('lodash.get');
const screenshotConfig = require('../screenshot/index').config;

const visitedUrls = new Set();

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const defaultConfig = {
  browser: 'chrome',
  iterations: 3,
  connectivity: {
    profile: 'native',
    downstreamKbps: undefined,
    upstreamKbps: undefined,
    latency: undefined,
    engine: 'external'
  },
  viewPort: '1366x708',
  delay: 0
};

const DEFAULT_METRICS_PAGE_SUMMARY = [
  'statistics.timings.pageTimings',
  'statistics.timings.rumSpeedIndex',
  'statistics.timings.fullyLoaded',
  'statistics.timings.firstPaint',
  'statistics.timings.userTimings',
  'statistics.visualMetrics.SpeedIndex',
  'statistics.visualMetrics.FirstVisualChange',
  'statistics.visualMetrics.VisualComplete85',
  'statistics.visualMetrics.VisualComplete95',
  'statistics.visualMetrics.VisualComplete99',
  'statistics.visualMetrics.LastVisualChange',
  'statistics.visualMetrics.PerceptualSpeedIndex',
  'statistics.custom.*',
  'statistics.cpu.categories.*',
  'statistics.cpu.events.*'
];

const DEFAULT_METRICS_SUMMARY = [
  'firstPaint',
  'rumSpeedIndex',
  'fullyLoaded',
  'pageTimings',
  'userTimings.marks',
  'userTimings.measures',
  'visualMetrics.SpeedIndex',
  'visualMetrics.FirstVisualChange',
  'visualMetrics.VisualComplete85',
  'visualMetrics.VisualComplete95',
  'visualMetrics.VisualComplete99',
  'visualMetrics.LastVisualChange',
  'visualMetrics.PerceptualSpeedIndex',
  'custom.*'
];

module.exports = {
  concurrency: 1,
  open(context, options) {
    this.make = context.messageMaker('browsertime').make;
    this.options = merge({}, defaultConfig, options.browsertime);
    merge(this.options, { verbose: options.verbose });
    this.firstParty = options.firstParty;
    this.options.mobile = options.mobile;
    this.storageManager = context.storageManager;
    this.resultUrls = context.resultUrls;
    this.pluginScripts = [];
    this.pluginAsyncScripts = [];
    browsertime.logging.configure(options);
    this.screenshotType = get(
      options,
      'screenshot.type',
      screenshotConfig.type
    );

    // hack for disabling viewport on Android that's not supported
    if (
      this.options.chrome &&
      this.options.chrome.android &&
      this.options.chrome.android.package
    ) {
      this.options.viewPort = undefined;
    }

    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGE_SUMMARY,
      'browsertime.pageSummary'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_SUMMARY,
      'browsertime.summary'
    );
  },
  processMessage(message, queue) {
    const make = this.make;
    function processCoachOutput(url, group, results) {
      return Promise.resolve(results.browserScripts).each((run, runIndex) => {
        const coachAdvice = run.coach.coachAdvice;

        // check if the coach has error(s)
        if (!isEmpty(coachAdvice.errors)) {
          log.error(
            '%s generated the following errors in the coach %:2j',
            url,
            coachAdvice.errors
          );
          queue.postMessage(
            make(
              'error',
              'The coach got the following errors: ' +
                JSON.stringify(coachAdvice.errors),
              {
                url,
                runIndex
              }
            )
          );
        }

        // if we miss the HAR from Firefox
        if (results.har) {
          // make sure to get the right run in the HAR
          const myHar = api.pickAPage(results.har, runIndex);

          return api
            .runHarAdvice(myHar)
            .then(harResult => api.merge(coachAdvice, harResult))
            .then(total =>
              queue.postMessage(
                make('coach.run', total, {
                  url,
                  group,
                  runIndex
                })
              )
            );
        } else {
          return queue.postMessage(
            make('coach.run', coachAdvice, {
              url,
              group,
              runIndex
            })
          );
        }
      });
    }

    switch (message.type) {
      case 'sitespeedio.setup': {
        // Let other plugins know that the browsertime plugin is alive
        queue.postMessage(make('browsertime.setup'));
        break;
      }
      case 'browsertime.config': {
        merge(this.options, message.data);
        break;
      }
      case 'browsertime.scripts': {
        if (message.data.category && message.data.scripts) {
          log.verbose('Got browsertime.scripts message:' + message);
          this.pluginScripts.push(message.data);
        } else {
          log.error(
            'Got wrong formated browsertime.scripts. You need category and scripts:' +
              message.data
          );
        }
        break;
      }
      case 'browsertime.asyncscripts': {
        if (message.data.category && message.data.scripts) {
          log.verbose('Got browsertime.asyncscripts message:' + message);
          this.pluginAsyncScripts.push(message.data);
        } else {
          log.error(
            'Got wrong formated browsertime.asyncscripts. You need category and scripts:' +
              message.data
          );
        }
        break;
      }
      case 'url': {
        const url = message.url;
        const group = message.group;

        visitedUrls.add(url);
        // manually set the resultBaseDir
        // it's used in BT when we record a video
        return this.storageManager
          .createDirForUrl(message.url, 'data')
          .then(dir => {
            this.options.resultDir = dir;
          })
          .then(() =>
            analyzer.analyzeUrl(
              url,
              this.options,
              this.pluginScripts,
              this.pluginAsyncScripts
            )
          )
          .tap(results => {
            log.verbose(
              'Result from Browsertime for %s with %:2j',
              url,
              results
            );
          })
          .tap(results => {
            results.browserScripts.forEach((run, runIndex) => {
              if (results.har) {
                // Add meta data to be used when we compare multiple HARs
                // the meta field is added in Browsertime
                const _meta = results.har.log.pages[runIndex]._meta;

                // add the defintion for first party/third party
                if (this.firstParty) {
                  _meta.firstParty = this.firstParty;
                }
                if (this.resultUrls.hasBaseUrl()) {
                  const base = this.resultUrls.absoluteSummaryPageUrl(url);
                  _meta.screenshot = `${base}data/screenshots/${runIndex}.${
                    this.screenshotType
                  }`;
                  _meta.result = `${base}${runIndex}.html`;
                  if (this.options.video) {
                    _meta.video = `${base}data/video/${runIndex}.mp4`;
                  }
                }
                run.har = api.pickAPage(results.har, runIndex);
              }

              // Kind of ugly way to add visualMetrics to a run
              // it's outside of browserScripts today
              // we could instead pass browsertime.visualMetrics maybe
              if (results.visualMetrics) {
                run.visualMetrics = results.visualMetrics[runIndex];
              }

              if (results.cpu) {
                run.cpu = results.cpu[runIndex];
              }

              run.timestamp = moment(results.timestamps[runIndex]).format(
                TIME_FORMAT
              );
              queue.postMessage(
                make('browsertime.run', run, {
                  url,
                  group,
                  runIndex
                })
              );
              aggregator.addToAggregate(run, group);
            });

            // Let take the first runs timestamp and use that as the summary timestamp
            results.timestamp = moment(results.timestamps[0]).format(
              TIME_FORMAT
            );
            queue.postMessage(
              make('browsertime.pageSummary', results, {
                url,
                group
              })
            );
          })
          .tap(results => {
            if (results.har) {
              queue.postMessage(
                make('browsertime.har', results.har, {
                  url,
                  group
                })
              );
            }
          })
          .tap(results => {
            forEach(results.extraJson, (value, key) => {
              const match = /^trace-(\d+).json$/.exec(key);
              if (match) {
                const runIndex = Number(match[1]);
                queue.postMessage(
                  make('browsertime.chrometrace', value, {
                    url,
                    group,
                    name: key,
                    runIndex
                  })
                );
              }
            });
          })
          .tap(results => {
            if (results.screenshots) {
              queue.postMessage(
                make('browsertime.screenshot', results.screenshots, {
                  url,
                  group
                })
              );
            }
          })
          .tap(results => {
            if (this.options.coach) {
              return processCoachOutput(url, group, results);
            }
          })
          .catch(BrowsertimeError, e => {
            log.error(
              '%s generated the following error in Browsertime %s',
              url,
              e
            );
            queue.postMessage(
              make('error', e.message, merge({ url }, e.extra))
            );
          });
      }

      case 'sitespeedio.summarize': {
        log.debug('Generate summary metrics from Browsertime');
        const summary = aggregator.summarize();
        if (summary) {
          for (let group of Object.keys(summary.groups)) {
            queue.postMessage(
              make('browsertime.summary', summary.groups[group], { group })
            );
          }
        }

        break;
      }
    }
  },
  config: defaultConfig
};
