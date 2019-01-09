'use strict';

const browsertime = require('browsertime');
const aggregator = require('./aggregator');
const api = require('webcoach');
const log = require('intel').getLogger('plugin.browsertime');
const merge = require('lodash.merge');
const analyzer = require('./analyzer');
const dayjs = require('dayjs-ext');
const isEmpty = require('lodash.isempty');
const get = require('lodash.get');
const defaultConfig = require('./default/config');
const urlParser = require('url');
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DEFAULT_METRICS_PAGE_SUMMARY = require('./default/metricsPageSummary');
const DEFAULT_METRICS_SUMMARY = require('./default/metricsSummary');
const ConsoleLogAggregator = require('./consoleLogAggregator');
const { getGzippedFileAsJson } = require('./reader.js');

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
        log.verbose('Result from Browsertime for %s with %:2j', url, result);
        for (let resultIndex = 0; resultIndex < result.length; resultIndex++) {
          url = result[resultIndex].info.url;
          group = urlParser.parse(url).hostname;
          let runIndex = 0;
          for (let run of result[resultIndex].browserScripts) {
            let harIndex = runIndex * result.length;
            harIndex += resultIndex;
            if (result.har) {
              // Add meta data to be used when we compare multiple HARs
              // the meta field is added in Browsertime
              if (result.har.log.pages[harIndex]) {
                const _meta = result.har.log.pages[harIndex]._meta;

                // add the definiton for first party/third party
                if (this.firstParty) {
                  _meta.firstParty = this.firstParty;
                }
                if (this.resultUrls.hasBaseUrl()) {
                  const base = this.resultUrls.absoluteSummaryPagePath(url);
                  _meta.screenshot = `${base}data/screenshots/${runIndex + 1}.${
                    this.screenshotType
                  }`;
                  _meta.result = `${base}${runIndex + 1}.html`;
                  if (options.video) {
                    _meta.video = `${base}data/video/${runIndex + 1}.mp4`;
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
            }

            // Kind of ugly way to add visualMetrics to a run
            // it's outside of browserScripts today
            // we could instead pass browsertime.visualMetrics maybe
            if (result[resultIndex].visualMetrics) {
              run.visualMetrics = result[resultIndex].visualMetrics[runIndex];
            }

            if (result[resultIndex].cpu) {
              run.cpu = result[resultIndex].cpu[runIndex];
            }

            run.timestamp = dayjs(
              result[resultIndex].timestamps[runIndex]
            ).format(TIME_FORMAT);

            queue.postMessage(
              make('browsertime.run', run, {
                url,
                group,
                runIndex,
                iteration: runIndex + 1
              })
            );

            if (options.chrome && options.chrome.collectConsoleLog) {
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
                const harResult = await api.runHarAdvice(myHar);
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
            result[
              resultIndex
            ].statistics.console = consoleLogAggregator.summarizeStats();
          }

          // Post the result on the queue so other plugins can use it
          queue.postMessage(
            make('browsertime.pageSummary', result[resultIndex], {
              url,
              group
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

          // Check for errors. Browsertime errors is an array of all iterations
          // [[],[],[]] where one iteration can have multiple errors
          for (let errorsForOneIteration of result[resultIndex].errors) {
            for (let error of errorsForOneIteration) {
              queue.postMessage(make('error', error, merge({ url })));
            }
          }
        }
        break;
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

        break;
      }
    }
  },
  config: defaultConfig
};
