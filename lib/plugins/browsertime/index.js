'use strict';

const browsertime = require('browsertime');
const Promise = require('bluebird');
const messageMaker = require('../../support/messageMaker');
const filterRegistry = require('../../support/filterRegistry');
const aggregator = require('./aggregator');
const api = require('webcoach');
const forEach = require('lodash.foreach');
const log = require('intel').getLogger('plugin.browsertime');
const merge = require('lodash.merge');
const BrowsertimeError = browsertime.errors.BrowsertimeError;
const analyzer = require('./analyzer');
const moment = require('moment');
const isEmpty = require('lodash.isempty');

const make = messageMaker('browsertime').make;

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
    tsproxy: {
      port: 1080
    },
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
  'statistics.visualMetrics.LastVisualChange',
  'statistics.visualMetrics.PerceptualSpeedIndex',
  'statistics.custom.*'
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
  'visualMetrics.LastVisualChange',
  'visualMetrics.PerceptualSpeedIndex',
  'custom.*'
];

function jsonifyVisualProgress(visualProgress) {
  // Original data looks like
  //  "0=0%, 1500=81%, 1516=81%, 1533=84%, 1550=84%, 1566=84%, 1600=95%, 1683=95%, 1833=100%"
  const progress = visualProgress.split(',');
  const visualProgressJSON = {};
  forEach(progress, value => {
    const eachMetric = value.split('=');
    visualProgressJSON[eachMetric[0].replace(' ', '')] = Number(
      eachMetric[1].replace('%', '')
    );
  });
  return visualProgressJSON;
}

module.exports = {
  concurrency: 1,
  open(context, options) {
    this.options = merge({}, defaultConfig, options.browsertime);
    this.options.mobile = options.mobile;
    this.storageManager = context.storageManager;
    this.resultUrls = context.resultUrls;

    browsertime.logging.configure(options);

    // hack for disabling viewport on Android that's not supported
    if (
      this.options.chrome &&
      this.options.chrome.android &&
      this.options.chrome.android.package
    ) {
      this.options.viewPort = undefined;
    }

    filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGE_SUMMARY,
      'browsertime.pageSummary'
    );
    filterRegistry.registerFilterForType(
      DEFAULT_METRICS_SUMMARY,
      'browsertime.summary'
    );
  },
  processMessage(message, queue) {
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
          .then(() => analyzer.analyzeUrl(url, this.options))
          .tap(results => {
            log.verbose(
              'Result from Browsertime for %s with %:2j',
              url,
              results
            );
          })
          .tap(results => {
            results.browserScripts.forEach((run, runIndex) => {
              // take the HAR from this run and add it to the
              // run data
              // sometimes Firefox can't create the HAR + in the future
              // we may wanna use Safari (without HAR)
              if (results.har) {
                // Add meta data to be used when we compare multiple HARs
                results.har.log.pages[runIndex]._meta = {};
                const _meta = results.har.log.pages[runIndex]._meta;
                _meta.connectivity = this.options.connectivity.profile;

                if (this.resultUrls.hasBaseUrl()) {
                  const base = this.resultUrls.absoluteSummaryPageUrl(url);
                  _meta.screenshot = `${base}data/screenshots/${runIndex}.png`;
                  _meta.result = `${base}${runIndex}.html`;
                  if (this.options.video) {
                    _meta.video = `${base}data/video/${runIndex}.mp4`;
                  }
                }

                // Setup visual metrics to use when we compare hars
                results.har.log.pages[runIndex]._visualMetrics = {};
                const _visualMetrics =
                  results.har.log.pages[runIndex]._visualMetrics;

                const pageTimings = results.har.log.pages[runIndex].pageTimings;

                // if we have first, complete85 and last visual change add it to the HAR file
                // so we can see it in the waterfall graph (PerfCascade automatically picks it up)
                if (results.visualMetrics && results.visualMetrics[runIndex]) {
                  pageTimings._firstVisualChange =
                    results.visualMetrics[runIndex].FirstVisualChange;
                  pageTimings._lastVisualChange =
                    results.visualMetrics[runIndex].LastVisualChange;
                  pageTimings._visualComplete85 =
                    results.visualMetrics[runIndex].VisualComplete85;
                  _visualMetrics.FirstVisualChange =
                    results.visualMetrics[runIndex].FirstVisualChange;
                  _visualMetrics.SpeedIndex =
                    results.visualMetrics[runIndex].SpeedIndex;
                  _visualMetrics.VisualComplete85 =
                    results.visualMetrics[runIndex].VisualComplete85;
                  _visualMetrics.LastVisualChange =
                    results.visualMetrics[runIndex].LastVisualChange;
                  _visualMetrics.VisualProgress = jsonifyVisualProgress(
                    results.visualMetrics[runIndex].VisualProgress
                  );
                } else if (run.timings.firstPaint) {
                  // only add first paint if we don't have visual metrics
                  pageTimings._firstPaint = run.timings.firstPaint;
                }
                if (run.timings.pageTimings) {
                  pageTimings._domInteractiveTime =
                    run.timings.pageTimings.domInteractiveTime;
                  pageTimings._domContentLoadedTime =
                    run.timings.pageTimings.domContentLoadedTime;
                }

                run.har = api.pickAPage(results.har, runIndex);
              }

              // Kind of ugly way to add visualMetrics to a run
              // it's outside of browserScripts today
              // we could instead pass browsertime.visualMetrics maybe
              if (results.visualMetrics) {
                run.visualMetrics = results.visualMetrics[runIndex];
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
            if (results.extraJson) {
              forEach(results.extraJson, (value, key) => {
                if (key.indexOf('trace' > -1)) {
                  queue.postMessage(
                    make('browsertime.chrometrace', value, {
                      url,
                      group,
                      name: key
                    })
                  );
                }
              });
            }
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

      case 'summarize': {
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
