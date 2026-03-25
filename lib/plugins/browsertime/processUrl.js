import dayjs from 'dayjs';
import { Stats } from 'fast-stats';
import { getLogger } from '@sitespeed.io/log';
import { summarizeStats } from '../../support/statsHelpers.js';
import { analyzeUrl } from './analyzer.js';
import { ConsoleLogAggregator } from './consoleLogAggregator.js';
import { AxeAggregator } from './axeAggregator.js';
import { getFilmstrip } from './filmstrip.js';
import { getGzippedFileAsJson } from './reader.js';
// eslint-disable-next-line unicorn/no-named-default
import { default as _merge } from 'lodash.merge';
import coach from 'coach-core';
const { pickAPage } = coach;
import { buildRun } from './buildRun.js';
import { processCoach } from './processCoach.js';

const log = getLogger('plugin.browsertime');

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function processAxeForRun(
  result,
  resultIndex,
  runIndex,
  axeAggregatorPerURL,
  axeAggregatorTotal,
  url,
  group,
  sendMessage
) {
  if (
    result[resultIndex].extras.length > 0 &&
    result[resultIndex].extras[runIndex].axe
  ) {
    const order = ['critical', 'serious', 'moderate', 'minor'];
    result[resultIndex].extras[runIndex].axe.violations.sort(
      (a, b) => order.indexOf(a.impact) > order.indexOf(b.impact)
    );

    axeAggregatorPerURL.addStats(result[resultIndex].extras[runIndex].axe);
    axeAggregatorTotal.addStats(result[resultIndex].extras[runIndex].axe);

    sendMessage('axe.run', result[resultIndex].extras[runIndex].axe, {
      url,
      group,
      runIndex,
      iteration: runIndex + 1
    });
    // Another hack: Browsertime automatically creates statistics for alla data in extras
    // but we don't really need that for AXE.
    delete result[resultIndex].extras[runIndex].axe;
    delete result[resultIndex].statistics.extras.axe;
  }
}

function getScreenshots(
  result,
  resultIndex,
  runIndex,
  resultUrls,
  url,
  allAlias
) {
  // The packaging of screenshots from browsertime
  // Is not optimal, the same array of screenshots hold all
  // screenshots from one run (the automatic ones and user generated)
  // If we only test one page per run, take all screenshots (user generated etc)
  if (result.length === 1) {
    return result[resultIndex].files.screenshot[runIndex];
  }
  // Push all screenshots
  const screenshots = [];
  if (result[resultIndex].files.screenshot.length > 0) {
    for (let screenshot of result[resultIndex].files.screenshot[runIndex]) {
      if (
        screenshot.includes(
          `${resultUrls.relativeSummaryPageUrl(url, allAlias[url])}data`
        )
      ) {
        screenshots.push(screenshot);
      }
    }
  }
  return screenshots;
}

export async function processUrl(message, context, sendMessage) {
  const {
    options,
    allOptions,
    storageManager,
    resultUrls,
    scriptOrMultiple,
    pluginScripts,
    pluginAsyncScripts,
    allAlias,
    firstParty,
    screenshotType,
    browsertimeAggregator,
    useAxe,
    axeAggregatorTotal,
    axeVersion
  } = context;

  let url = message.url;
  let group = message.group;
  try {
    // manually set the resultBaseDir
    // it's used in BT when we record a video
    options.resultDir = await storageManager.getBaseDir();
    const consoleLogAggregator = new ConsoleLogAggregator(options);
    const result = await analyzeUrl(
      url,
      scriptOrMultiple,
      pluginScripts,
      pluginAsyncScripts,
      options
    );

    // We need to check for alias first, since when we send the HAR (include all runs)
    // need to know if alias exists, else we will end up with things like
    // https://github.com/sitespeedio/sitespeed.io/issues/2341
    for (const element of result) {
      // Browsertime supports alias for URLS in a script
      const alias = element.info?.alias;
      if (alias) {
        if (scriptOrMultiple) {
          url = element.info.url;
          group = new URL(url).hostname;
        }
        allAlias[url] = alias;
        sendMessage('browsertime.alias', alias, {
          url,
          group
        });
      }
    }

    const errorStats = new Stats();
    let axeAggregatorPerURL;
    for (let resultIndex = 0; resultIndex < result.length; resultIndex++) {
      axeAggregatorPerURL = new AxeAggregator(options);
      // Send errors from Browsertime as early as possible
      // Check for errors. Browsertime errors is an array of all iterations
      // [[],[],[]] where one iteration can have multiple errors
      for (let errorsForOneIteration of result[resultIndex].errors) {
        if (Array.isArray(errorsForOneIteration)) {
          for (let error of errorsForOneIteration) {
            sendMessage('error', error, _merge({ url }));
          }
        } else {
          sendMessage(
            'error',
            `${errorsForOneIteration} ${result[resultIndex].failureMessages}`,
            _merge({ url })
          );
        }
      }
      // If we use scripts or multiple, use the URL from the tested page
      // so that we can handle click on links etc
      // see https://github.com/sitespeedio/sitespeed.io/issues/2260
      // we could change the plugins but since they do not work with
      // multiple/scripting lets do it like this for now
      if (scriptOrMultiple) {
        url = result[resultIndex].info?.url;
        if (url) {
          group = new URL(url).hostname;
        }
      }
      let runIndex = 0;
      for (let browserScriptsData of result[resultIndex].browserScripts) {
        let run = buildRun(result, resultIndex, runIndex);

        let harIndex = runIndex * result.length;
        harIndex += resultIndex;
        if (result.har) {
          const testInfo = { browser: result.har.log.browser };
          // Let the plugins now what browser we are using at the moment
          if (result.har.log._android) {
            testInfo.android = result.har.log._android;
          }
          sendMessage('browsertime.browser', testInfo);
          // Add meta data to be used when we compare multiple HARs
          // the meta field is added in Browsertime
          if (result.har.log.pages[harIndex]) {
            const _meta = result.har.log.pages[harIndex]._meta;

            // add the definiton for first party/third party
            if (firstParty) {
              _meta.firstParty = firstParty;
            }
            if (resultUrls.hasBaseUrl()) {
              const base = resultUrls.absoluteSummaryPagePath(
                url,
                allAlias[url]
              );
              _meta.screenshot = `${base}data/screenshots/${
                runIndex + 1
              }/afterPageCompleteCheck.${screenshotType}`;
              _meta.result = `${base}${runIndex + 1}.html`;
              if (options.video) {
                _meta.video = `${base}data/video/${runIndex + 1}.mp4`;
                _meta.filmstrip = await getFilmstrip(
                  run,
                  `${runIndex + 1}`,
                  `${
                    options.resultDir
                  }/${resultUrls.relativeSummaryPageUrl(url, allAlias[url])}`,
                  allOptions,
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
              sendMessage('error', message, {
                url,
                runIndex,
                iteration: runIndex + 1
              });
            } else {
              log.error('Couldnt get the right page for the HAR', harError);
              sendMessage(
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
            sendMessage('browsertime.browser', testInfo);
          }
        }

        // Hack to get axe data. In the future we can make this more generic
        processAxeForRun(
          result,
          resultIndex,
          runIndex,
          axeAggregatorPerURL,
          axeAggregatorTotal,
          url,
          group,
          sendMessage
        );

        run.screenshots = getScreenshots(
          result,
          resultIndex,
          runIndex,
          resultUrls,
          url,
          allAlias
        );
        run.video = result[resultIndex].files.video[runIndex];

        // calculate errors
        for (let error of result[resultIndex].errors) {
          errorStats.push(error.length);
        }

        sendMessage('browsertime.run', run, {
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

            sendMessage('browsertime.console', consoleData, {
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
          allOptions.postChromeTrace
        ) {
          const traceData = await getGzippedFileAsJson(
            options.resultDir,
            `trace-${runIndex + 1}.json.gz`
          );
          sendMessage('browsertime.chrometrace', traceData, {
            url,
            group,
            name: `trace-${runIndex + 1}.json`,
            runIndex
          });
        }

        // If the coach is turned on, collect the coach result
        if (options.coach) {
          await processCoach(
            browserScriptsData,
            result,
            harIndex,
            options,
            url,
            group,
            runIndex,
            sendMessage
          );
        }

        browsertimeAggregator.addToAggregate(run, group);
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
      sendMessage('browsertime.pageSummary', result[resultIndex], {
        url,
        group,
        runTime: result.timestamp
      });
      // Post the HAR on the queue so other plugins can use it
      if (result.har) {
        sendMessage('browsertime.har', result.har, {
          url,
          group
        });
      }

      // Post the result on the queue so other plugins can use it
      if (useAxe) {
        let stats = axeAggregatorPerURL.summarizeStats();
        stats.testEngine = { version: axeVersion, name: 'axe-core' };
        sendMessage('axe.pageSummary', stats, {
          url,
          group
        });
      }
    }
  } catch (error) {
    sendMessage('error', error, _merge({ url }));
    log.error('Caught error from Browsertime', error);
  }
}
