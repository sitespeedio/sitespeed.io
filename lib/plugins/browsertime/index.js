'use strict';

const browsertime = require('browsertime');
const aggregator = require('./aggregator');
const api = require('coach-core');
const log = require('intel').getLogger('plugin.browsertime');
const merge = require('lodash.merge');
const analyzer = require('./analyzer');
const dayjs = require('dayjs');
const isEmpty = require('lodash.isempty');
const get = require('lodash.get');
const defaultConfig = require('./default/config');
const urlParser = require('url');
const Stats = require('fast-stats').Stats;
const statsHelpers = require('../../support/statsHelpers');
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DEFAULT_METRICS_PAGE_SUMMARY = require('./default/metricsPageSummary');
const DEFAULT_METRICS_SUMMARY = require('./default/metricsSummary');
const ConsoleLogAggregator = require('./consoleLogAggregator');
const AxeAggregator = require('./axeAggregator');
const filmstrip = require('./filmstrip');
const { getGzippedFileAsJson } = require('./reader.js');

module.exports = {
  concurrency: 1,
  open(context, options) {
    this.make = context.messageMaker('browsertime').make;
    this.useAxe = options.axe && options.axe.enable;
    this.options = merge({}, defaultConfig, options.browsertime);
    this.allOptions = options;
    merge(this.options, { verbose: options.verbose, axe: options.axe });
    this.firstParty = options.firstParty;
    this.options.mobile = options.mobile;
    this.storageManager = context.storageManager;
    this.resultUrls = context.resultUrls;
    this.postChromeTrace = options.postChromeTrace;
    this.pluginScripts = [];
    this.pluginAsyncScripts = [];
    browsertime.logging.configure(options);
    this.screenshotType = get(
      options,
      'browsertime.screenshotParams.type',
      defaultConfig.screenshotParams.type
    );
    this.scriptOrMultiple = options.multi;
    this.allAlias = {};

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
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_SUMMARY,
      'browsertime.run'
    );
    this.axeAggregatorTotal = new AxeAggregator(this.options);
  },
  async processMessage(message, queue) {
    const make = this.make;
    const options = this.options;
    switch (message.type) {
      // When sistespeed.io starts, a setup messages is posted on the queue
      // and all plugins can tell other plugins that they are alive and are ready
      // to receive configuration
      case 'sitespeedio.setup': {
        // Let other plugins know that the browsertime plugin is alive
        queue.postMessage(make('browsertime.setup'));
        // Unfify alias setup
        if (this.options.urlMetaData) {
          for (let url of Object.keys(this.options.urlMetaData)) {
            const alias = this.options.urlMetaData[url];
            const group = urlParser.parse(url).hostname;
            this.allAlias[alias] = url;
            queue.postMessage(
              make('browsertime.alias', alias, {
                url,
                group
              })
            );
          }
        }

        // If sceenshots is turned on, tell other plugins that we will use it and
        // what type of images that are used (so for exmaple the HTML pluin can create
        // correct links).
        if (options.screenshot) {
          queue.postMessage(
            make('browsertime.config', {
              screenshot: true,
              screenshotType: this.screenshotType
            })
          );
        }
        break;
      }
      // Another plugin sent configuration options to Browsertime
      case 'browsertime.config': {
        merge(options, message.data);
        break;
      }
      // Andother plugin got JavaScript that they want to run in Browsertime
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
      // Andother plugin got async JavaScript that they want to run in Browsertime
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
      // We got a URL that we want to test
      case 'browsertime.navigationScripts':
      case 'url': {
        let url = message.url;
        let group = message.group;
        try {
          // manually set the resultBaseDir
          // it's used in BT when we record a video
          options.resultDir = await this.storageManager.getBaseDir();
          const consoleLogAggregator = new ConsoleLogAggregator(options);
          const result = await analyzer.analyzeUrl(
            url,
            this.scriptOrMultiple,
            this.pluginScripts,
            this.pluginAsyncScripts,
            options
          );

          // We need to check for alias first, since when we send the HAR (incliude all runs)
          // need to know if alias exists, else we will end up with things like
          // https://github.com/sitespeedio/sitespeed.io/issues/2341
          for (
            let resultIndex = 0;
            resultIndex < result.length;
            resultIndex++
          ) {
            // Browsertime supports alias for URLS in a script
            const alias = result[resultIndex].info.alias;
            if (alias) {
              if (this.scriptOrMultiple) {
                url = result[resultIndex].info.url;
                group = urlParser.parse(url).hostname;
              }
              this.allAlias[url] = alias;
              queue.postMessage(
                make('browsertime.alias', alias, {
                  url,
                  group
                })
              );
            }
          }

          const errorStats = new Stats();
          let axeAggregatorPerURL;
          for (
            let resultIndex = 0;
            resultIndex < result.length;
            resultIndex++
          ) {
            axeAggregatorPerURL = new AxeAggregator(this.options);
            // If we use scripts or multiple, use the URL from the tested page
            // so that we can handle click on links etc
            // see https://github.com/sitespeedio/sitespeed.io/issues/2260
            // we could change the plugins but since they do not work with
            // multiple/scripting lets do it like this for now
            if (this.scriptOrMultiple) {
              url = result[resultIndex].info.url;
              group = urlParser.parse(url).hostname;
            }
            let runIndex = 0;
            for (let run of result[resultIndex].browserScripts) {
              // Kind of ugly way to add visualMetrics to a run
              // it's outside of browserScripts today
              // we could instead pass browsertime.visualMetrics maybe
              if (result[resultIndex].visualMetrics) {
                run.visualMetrics = result[resultIndex].visualMetrics[runIndex];
              }

              if (result[resultIndex].googleWebVitals) {
                run.googleWebVitals =
                  result[resultIndex].googleWebVitals[runIndex];
              }

              let harIndex = runIndex * result.length;
              harIndex += resultIndex;
              if (result.har) {
                const testInfo = { browser: result.har.log.browser };
                // Let the plugins now what browser we are using at the moment
                if (result.har.log._android) {
                  testInfo.android = result.har.log._android;
                }
                queue.postMessage(make('browsertime.browser', testInfo));
                // Add meta data to be used when we compare multiple HARs
                // the meta field is added in Browsertime
                if (result.har.log.pages[harIndex]) {
                  const _meta = result.har.log.pages[harIndex]._meta;

                  // add the definiton for first party/third party
                  if (this.firstParty) {
                    _meta.firstParty = this.firstParty;
                  }
                  if (this.resultUrls.hasBaseUrl()) {
                    const base = this.resultUrls.absoluteSummaryPagePath(
                      url,
                      this.allAlias[url]
                    );
                    _meta.screenshot = `${base}data/screenshots/${
                      runIndex + 1
                    }/afterPageCompleteCheck.${this.screenshotType}`;
                    _meta.result = `${base}${runIndex + 1}.html`;
                    if (options.video) {
                      _meta.video = `${base}data/video/${runIndex + 1}.mp4`;
                      _meta.filmstrip = await filmstrip.getFilmstrip(
                        run,
                        `${runIndex + 1}`,
                        `${
                          options.resultDir
                        }/${this.resultUrls.relativeSummaryPageUrl(
                          url,
                          this.allAlias[url]
                        )}`,
                        this.allOptions,
                        `${base}data/filmstrip/${runIndex + 1}/`
                      );
                    }
                  }
                } else {
                  log.error(
                    'Could not find the right index %s for har for url %s ',
                    harIndex,
                    url
                  );
                }
                run.har = api.pickAPage(result.har, harIndex);
              } else {
                // If we do not have a HAR, use browser info from the result
                if (result.length > 0) {
                  const testInfo = {
                    browser: {
                      name: result[0].info.browser.name,
                      version: result[0].info.browser.version
                    }
                  };
                  queue.postMessage(make('browsertime.browser', testInfo));
                }
              }

              // Hack to get axe data. In the future we can make this more generic
              if (result[resultIndex].extras.length > 0) {
                if (result[resultIndex].extras[runIndex].axe) {
                  const order = ['critical', 'serious', 'moderate', 'minor'];
                  result[resultIndex].extras[runIndex].axe.violations.sort(
                    (a, b) => order.indexOf(a.impact) > order.indexOf(b.impact)
                  );

                  axeAggregatorPerURL.addStats(
                    result[resultIndex].extras[runIndex].axe
                  );

                  this.axeAggregatorTotal.addStats(
                    result[resultIndex].extras[runIndex].axe
                  );

                  queue.postMessage(
                    make('axe.run', result[resultIndex].extras[runIndex].axe, {
                      url,
                      group,
                      runIndex,
                      iteration: runIndex + 1
                    })
                  );
                  // Another hack: Browsertime automatically creates statistics for alla data in extras
                  // but we don't really need that for AXE.
                  delete result[resultIndex].extras[runIndex].axe;
                  delete result[resultIndex].statistics.extras.axe;
                }
              }
              if (result[resultIndex].cpu) {
                run.cpu = result[resultIndex].cpu[runIndex];
              }

              if (result[resultIndex].memory) {
                run.memory = result[resultIndex].memory[runIndex];
              }

              if (result[resultIndex].extras) {
                run.extras = result[resultIndex].extras[runIndex];
              }

              if (
                result[resultIndex].cdp &&
                result[resultIndex].cdp.performance
              ) {
                run.cdp = {
                  performance: result[resultIndex].cdp.performance[runIndex]
                };
              }

              if (result[resultIndex].fullyLoaded) {
                run.fullyLoaded = result[resultIndex].fullyLoaded[runIndex];
              }

              if (result[resultIndex].info.title) {
                run.title = result[resultIndex].info.title;
              }

              if (result[resultIndex].info.description) {
                run.description = result[resultIndex].info.description;
              }

              if (result[resultIndex].info.android) {
                run.android = result[resultIndex].info.android;
                run.android.batteryTemperature =
                  result[resultIndex].android.batteryTemperature[runIndex];
              }

              if (result[resultIndex].info.ios) {
                run.ios = result[resultIndex].info.ios;
              }

              run.timestamp = dayjs(
                result[resultIndex].timestamps[runIndex]
              ).format(TIME_FORMAT);

              run.errors = result[resultIndex].errors[runIndex];
              // The packaging of screenshots from browsertime
              // Is not optimal, the same array of screenshots hold all
              // screenshots from one run (the automatic ones and user generated)

              // If we only test one page per run, take all screenshots (user generated etc)
              if (result.length === 1) {
                run.screenshots =
                  result[resultIndex].files.screenshot[runIndex];
              } else {
                // Push all screenshots
                run.screenshots = [];
                for (let screenshot of result[resultIndex].files.screenshot[
                  runIndex
                ]) {
                  if (
                    screenshot.indexOf(
                      `${this.resultUrls.relativeSummaryPageUrl(
                        url,
                        this.allAlias[url]
                      )}data`
                    ) > -1
                  ) {
                    run.screenshots.push(screenshot);
                  }
                }
              }

              run.video = result[resultIndex].files.video[runIndex];

              // calculate errors
              for (let error of result[resultIndex].errors) {
                errorStats.push(error.length);
              }

              queue.postMessage(
                make('browsertime.run', run, {
                  url,
                  group,
                  runIndex,
                  iteration: runIndex + 1
                })
              );

              if (
                options.chrome &&
                options.chrome.collectConsoleLog &&
                options.browser === 'chrome'
              ) {
                try {
                  const consoleData = await consoleLogAggregator.addStats(
                    runIndex + 1,
                    result[resultIndex].files.consoleLog[runIndex]
                  );

                  queue.postMessage(
                    make('browsertime.console', consoleData, {
                      url,
                      group,
                      runIndex,
                      iteration: runIndex + 1
                    })
                  );
                } catch (e) {
                  // This could happen if the run failed somehow
                  log.error('Could not fetch the console log');
                }
              }

              // In Browsertime 2.x the tracelog was part of the result but since 3.x
              // it is stored to disk. If you want it passed around in the queue, just add
              // --postChromeTrace
              if (
                options.chrome &&
                options.chrome.timeline &&
                this.postChromeTrace
              ) {
                const traceData = await getGzippedFileAsJson(
                  options.resultDir,
                  `trace-${runIndex + 1}.json.gz`
                );
                queue.postMessage(
                  make('browsertime.chrometrace', traceData, {
                    url,
                    group,
                    name: `trace-${runIndex + 1}.json`, // backward compatible to 2.x
                    runIndex
                  })
                );
              }

              // If the coach is turned on, collect the coach result
              if (options.coach) {
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
                        runIndex,
                        iteration: runIndex + 1
                      }
                    )
                  );
                }

                let advice = coachAdvice;
                // If we run without HAR
                if (result.har) {
                  // make sure to get the right run in the HAR
                  const myHar = api.pickAPage(result.har, harIndex);
                  const harResult = await api.analyseHar(
                    myHar,
                    undefined,
                    coachAdvice,
                    options
                  );
                  advice = api.merge(coachAdvice, harResult);
                }
                queue.postMessage(
                  make('coach.run', advice, {
                    url,
                    group,
                    runIndex,
                    iteration: runIndex + 1
                  })
                );
              }

              aggregator.addToAggregate(run, group);
              runIndex++;
            }

            // Let take the first runs timestamp and use that as the summary timestamp
            result.timestamp = dayjs(result[resultIndex].timestamps[0]).format(
              TIME_FORMAT
            );

            if (options.chrome && options.chrome.collectConsoleLog) {
              result[resultIndex].statistics.console =
                consoleLogAggregator.summarizeStats();
            }

            result[resultIndex].statistics.errors =
              statsHelpers.summarizeStats(errorStats);

            // Post the result on the queue so other plugins can use it
            queue.postMessage(
              make('browsertime.pageSummary', result[resultIndex], {
                url,
                group,
                runTime: result.timestamp
              })
            );
            // Post the HAR on the queue so other plugins can use it
            if (result.har) {
              queue.postMessage(
                make('browsertime.har', result.har, {
                  url,
                  group
                })
              );
            }

            // Post the result on the queue so other plugins can use it
            if (this.useAxe) {
              queue.postMessage(
                make('axe.pageSummary', axeAggregatorPerURL.summarizeStats(), {
                  url,
                  group
                })
              );
            }

            // Check for errors. Browsertime errors is an array of all iterations
            // [[],[],[]] where one iteration can have multiple errors
            for (let errorsForOneIteration of result[resultIndex].errors) {
              for (let error of errorsForOneIteration) {
                queue.postMessage(make('error', error, merge({ url })));
              }
            }
          }
          break;
        } catch (error) {
          queue.postMessage(make('error', error, merge({ url })));
          log.error('Caught error from Browsertime', error);
          break;
        }
      }
      // It's time to summarize the metrics for all pages and runs
      // and post the summary on the queue
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

        if (this.useAxe) {
          queue.postMessage(
            make('axe.summary', this.axeAggregatorTotal.summarizeStats(), {
              group: 'total'
            })
          );
        }

        break;
      }
    }
  },
  config: defaultConfig
};
