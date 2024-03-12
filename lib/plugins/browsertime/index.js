import { parse } from 'node:url';

import { default as _merge } from 'lodash.merge';

import intel from 'intel';
const log = intel.getLogger('plugin.browsertime');

import dayjs from 'dayjs';
import isEmpty from 'lodash.isempty';
import get from 'lodash.get';
import { Stats } from 'fast-stats';
import coach from 'coach-core';
const {
  pickAPage,
  analyseHar,
  merge,
  getThirdPartyWebVersion,
  getWappalyzerCoreVersion
} = coach;
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { summarizeStats } from '../../support/statsHelpers.js';
import { analyzeUrl } from './analyzer.js';

import { BrowsertimeAggregator } from './browsertimeAggregator.js';
import { metricsPageSummary as DEFAULT_METRICS_PAGE_SUMMARY } from './default/metricsPageSummary.js';
import { metricsSummary as DEFAULT_METRICS_SUMMARY } from './default/metricsSummary.js';
import { metricsRun as DEFAULT_METRICS_RUN } from './default/metricsRun.js';
import { metricsRunLimited as DEFAULT_METRICS_RUN_LIMITED } from './default/metricsRunLimited.js';
import { ConsoleLogAggregator } from './consoleLogAggregator.js';
import { AxeAggregator } from './axeAggregator.js';
import { getFilmstrip } from './filmstrip.js';
import { getGzippedFileAsJson } from './reader.js';
import { browsertimeDefaultSettings as defaultConfig } from './default/config.js';

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export default class BrowsertimePlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'browsertime', options, context, queue });
  }

  concurrency = 1;

  open(context, options) {
    //   this.make = context.messageMaker('browsertime').make;
    this.useAxe = options.axe && options.axe.enable;
    this.options = _merge({}, defaultConfig, options.browsertime);
    this.allOptions = options;
    _merge(this.options, { verbose: options.verbose, axe: options.axe });
    this.firstParty = options.firstParty;
    this.options.mobile = options.mobile;
    this.storageManager = context.storageManager;
    this.resultUrls = context.resultUrls;
    this.postChromeTrace = options.postChromeTrace;
    this.pluginScripts = [];
    this.pluginAsyncScripts = [];
    this.screenshotType = get(
      options,
      'browsertime.screenshotParams.type',
      defaultConfig.screenshotParams.type
    );

    this.scriptOrMultiple = options.multi;
    this.allAlias = {};
    this.browsertimeAggregator = new BrowsertimeAggregator();

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
      this.options.limitedRunData
        ? DEFAULT_METRICS_RUN_LIMITED
        : DEFAULT_METRICS_RUN,
      'browsertime.run'
    );
    this.axeAggregatorTotal = new AxeAggregator(this.options);
  }
  async processMessage(message) {
    const { configureLogging } = await import('browsertime');
    configureLogging(this.options);
    const options = this.options;
    switch (message.type) {
      // When sistespeed.io starts, a setup messages is posted on the queue
      // and all plugins can tell other plugins that they are alive and are ready
      // to receive configuration
      case 'sitespeedio.setup': {
        // Let other plugins know that the browsertime plugin is alive
        super.sendMessage('browsertime.setup');
        // Unfify alias setup
        if (this.options.urlMetaData) {
          for (let url of Object.keys(this.options.urlMetaData)) {
            const alias = this.options.urlMetaData[url];
            const group = parse(url).hostname;
            this.allAlias[alias] = url;
            super.sendMessage('browsertime.alias', alias, {
              url,
              group
            });
          }
        }

        // If sceenshots is turned on, tell other plugins that we will use it and
        // what type of images that are used (so for exmaple the HTML pluin can create
        // correct links).
        if (options.screenshot) {
          super.sendMessage('browsertime.config', {
            screenshot: true,
            screenshotType: this.screenshotType
          });
        }
        break;
      }
      // Another plugin sent configuration options to Browsertime
      case 'browsertime.config': {
        _merge(options, message.data);
        break;
      }

      case 'axe.setup': {
        this.axeVersion = message.data.version;
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
          const result = await analyzeUrl(
            url,
            this.scriptOrMultiple,
            this.pluginScripts,
            this.pluginAsyncScripts,
            options
          );

          // We need to check for alias first, since when we send the HAR (include all runs)
          // need to know if alias exists, else we will end up with things like
          // https://github.com/sitespeedio/sitespeed.io/issues/2341
          for (const element of result) {
            // Browsertime supports alias for URLS in a script
            const alias = element.info.alias;
            if (alias) {
              if (this.scriptOrMultiple) {
                url = element.info.url;
                group = parse(url).hostname;
              }
              this.allAlias[url] = alias;
              super.sendMessage('browsertime.alias', alias, {
                url,
                group
              });
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
              group = parse(url).hostname;
            }
            let runIndex = 0;
            for (let browserScriptsData of result[resultIndex].browserScripts) {
              let run = {};
              Object.assign(run, browserScriptsData);

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
                super.sendMessage('browsertime.browser', testInfo);
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
                      _meta.filmstrip = await getFilmstrip(
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
                try {
                  run.har = pickAPage(result.har, harIndex);
                } catch (harError) {
                  if (message.type === 'browsertime.navigationScripts') {
                    const message =
                      'There are pages that misses data. This is in almost all cases caused by that you try to measure a page view but you do not navigate to a new page.';
                    log.error(message, harError);
                    super.sendMessage('error', message, {
                      url,
                      runIndex,
                      iteration: runIndex + 1
                    });
                  } else {
                    log.error(
                      'Couldnt get the right page for the HAR',
                      harError
                    );
                    super.sendMessage(
                      'error',
                      'Could not get the right page for the HAR, the page is missing',
                      {
                        url,
                        runIndex,
                        iteration: runIndex + 1
                      }
                    );
                  }
                }
              } else {
                // If we do not have a HAR, use browser info from the result
                if (result.length > 0) {
                  const testInfo = {
                    browser: {
                      name: result[0].info.browser.name,
                      version: result[0].info.browser.version
                    }
                  };
                  super.sendMessage('browsertime.browser', testInfo);
                }
              }

              // Hack to get axe data. In the future we can make this more generic
              if (
                result[resultIndex].extras.length > 0 &&
                result[resultIndex].extras[runIndex].axe
              ) {
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

                super.sendMessage(
                  'axe.run',
                  result[resultIndex].extras[runIndex].axe,
                  {
                    url,
                    group,
                    runIndex,
                    iteration: runIndex + 1
                  }
                );
                // Another hack: Browsertime automatically creates statistics for alla data in extras
                // but we don't really need that for AXE.
                delete result[resultIndex].extras[runIndex].axe;
                delete result[resultIndex].statistics.extras.axe;
              }
              if (result[resultIndex].cpu) {
                run.cpu = result[resultIndex].cpu[runIndex];
              }

              if (result[resultIndex].powerConsumption) {
                run.powerConsumption =
                  result[resultIndex].powerConsumption[runIndex];
              }

              if (result[resultIndex].memory) {
                run.memory = result[resultIndex].memory[runIndex];
              }

              if (result[resultIndex].powerConsumption) {
                run.powerConsumption =
                  result[resultIndex].powerConsumption[runIndex];
              }

              if (result[resultIndex].extras) {
                run.extras = result[resultIndex].extras[runIndex];
              }

              run.markedAsFailure = result[resultIndex].markedAsFailure;

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

              if (result[resultIndex].renderBlocking) {
                run.renderBlocking =
                  result[resultIndex].renderBlocking[runIndex];
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
                    screenshot.includes(
                      `${this.resultUrls.relativeSummaryPageUrl(
                        url,
                        this.allAlias[url]
                      )}data`
                    )
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

              super.sendMessage('browsertime.run', run, {
                url,
                group,
                runIndex,
                runTime: run.timestamp,
                iteration: runIndex + 1
              });

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

                  super.sendMessage('browsertime.console', consoleData, {
                    url,
                    group,
                    runIndex,
                    iteration: runIndex + 1
                  });
                } catch {
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
                super.sendMessage('browsertime.chrometrace', traceData, {
                  url,
                  group,
                  name: `trace-${runIndex + 1}.json`,
                  runIndex
                });
              }

              // If the coach is turned on, collect the coach result
              if (options.coach) {
                try {
                  const coachAdvice = browserScriptsData.coach.coachAdvice;
                  // check if the coach has error(s)
                  if (!isEmpty(coachAdvice.errors)) {
                    log.error(
                      '%s generated the following errors in the coach %:2j',
                      url,
                      coachAdvice.errors
                    );
                    super.sendMessage(
                      'error',
                      'The coach got the following errors: ' +
                        JSON.stringify(coachAdvice.errors),
                      {
                        url,
                        runIndex,
                        iteration: runIndex + 1
                      }
                    );
                  }

                  let advice = coachAdvice;
                  // If we run without HAR
                  if (result.har) {
                    // make sure to get the right run in the HAR
                    const myHar = pickAPage(result.har, harIndex);

                    const harResult = await analyseHar(
                      myHar,
                      undefined,
                      coachAdvice,
                      options
                    );
                    advice = merge(coachAdvice, harResult);
                  }
                  const thirdPartyWebVersion = getThirdPartyWebVersion();
                  const wappalyzerVersion = getWappalyzerCoreVersion();
                  advice.thirdPartyWebVersion = thirdPartyWebVersion;
                  advice.wappalyzerVersion = wappalyzerVersion;

                  super.sendMessage('coach.run', advice, {
                    url,
                    group,
                    runIndex,
                    iteration: runIndex + 1
                  });
                } catch (error) {
                  log.error('Could not generate coach data', error);
                }
              }

              this.browsertimeAggregator.addToAggregate(run, group);
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

            result[resultIndex].statistics.errors = summarizeStats(errorStats);

            // Post the result on the queue so other plugins can use it
            super.sendMessage('browsertime.pageSummary', result[resultIndex], {
              url,
              group,
              runTime: result.timestamp
            });
            // Post the HAR on the queue so other plugins can use it
            if (result.har) {
              super.sendMessage('browsertime.har', result.har, {
                url,
                group
              });
            }

            // Post the result on the queue so other plugins can use it
            if (this.useAxe) {
              let stats = axeAggregatorPerURL.summarizeStats();
              stats.testEngine = { version: this.axeVersion, name: 'axe-core' };
              super.sendMessage('axe.pageSummary', stats, {
                url,
                group
              });
            }

            // Check for errors. Browsertime errors is an array of all iterations
            // [[],[],[]] where one iteration can have multiple errors
            for (let errorsForOneIteration of result[resultIndex].errors) {
              for (let error of errorsForOneIteration) {
                super.sendMessage('error', error, _merge({ url }));
              }
            }
          }
          break;
        } catch (error) {
          super.sendMessage('error', error, _merge({ url }));
          log.error('Caught error from Browsertime', error);
          break;
        }
      }
      // It's time to summarize the metrics for all pages and runs
      // and post the summary on the queue
      case 'sitespeedio.summarize': {
        log.debug('Generate summary metrics from Browsertime');
        const summary = this.browsertimeAggregator.summarize();
        if (summary) {
          for (let group of Object.keys(summary.groups)) {
            super.sendMessage('browsertime.summary', summary.groups[group], {
              group
            });
          }
        }

        if (this.useAxe) {
          super.sendMessage(
            'axe.summary',
            this.axeAggregatorTotal.summarizeStats(),
            {
              group: 'total'
            }
          );
        }

        break;
      }
    }
  }
}

export { browsertimeDefaultSettings as config } from './default/config.js';
