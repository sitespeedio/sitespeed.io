import path from 'node:path';
import { platform } from 'node:os';
import { createRequire } from 'node:module';
import { readFileSync, statSync } from 'node:fs';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import merge from 'lodash.merge';
import reduce from 'lodash.reduce';
import set from 'lodash.set';
import get from 'lodash.get';
import { findUpSync } from 'find-up';

import { getURLs, getAliases } from './util.js';
import { toArray } from '../support/util.js';
import friendlynames from '../support/friendlynames.js';
import { config as browsertimeConfig } from '../plugins/browsertime/index.js';
import { config as metricsConfig } from '../plugins/metrics/index.js';
import { config as slackConfig } from '../plugins/slack/index.js';
import { config as htmlConfig } from '../plugins/html/index.js';
import { messageTypes as matrixMessageTypes } from '../plugins/matrix/index.js';

const metricList = Object.keys(friendlynames);
const require = createRequire(import.meta.url);
const version = require('../../package.json').version;

const configFiles = ['.sitespeed.io.json'];

if (process.argv.includes('--config')) {
  const index = process.argv.indexOf('--config');
  configFiles.unshift(process.argv[index + 1]);
}

const configPath = findUpSync(configFiles);
let config;

try {
  config = configPath ? JSON.parse(readFileSync(configPath)) : undefined;
  if (config && process.argv.includes('--ignoreExtends')) {
    delete config.extends;
  }
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error(
      'Error: Could not parse the config JSON file ' +
        configPath +
        '. Is the file really valid JSON?'
    );
  }
  throw error;
}

function validateInput(argv) {
  // Check NodeJS major version
  const fullVersion = process.versions.node;
  const minVersion = 14;
  const majorVersion = fullVersion.split('.')[0];
  if (majorVersion < minVersion) {
    return (
      'Error: You need to have at least NodeJS version ' +
      minVersion +
      ' to run sitespeed.io. You are using version ' +
      fullVersion
    );
  }

  if (argv.headless && (argv.video || argv.visualMetrics)) {
    return 'Error: You cannot combine headless with video/visualMetrics because they need a screen to work.';
  }

  if (Array.isArray(argv.browsertime.iterations)) {
    return 'Error: Ooops you passed number of iterations twice, remove one of them and try again.';
  }

  if (Array.isArray(argv.browser)) {
    return 'Error: You can only run with one browser at a time.';
  }

  if (argv.outputFolder && argv.copyLatestFilesToBase) {
    return 'Error: Setting --outputfolder do not work together with --copyLatestFilesToBase';
  }

  if (argv.slug) {
    const characters = /[^\w-]/g;
    if (characters.test(argv.slug)) {
      return 'The slug can only use characters A-Z a-z 0-9 and -_.';
    }
    if (argv.slug.length > 200) {
      return 'The max length for the slug is 200 characters.';
    }
  }

  if (argv.crawler && argv.crawler.depth && argv.multi) {
    return 'Error: Crawl do not work running in multi mode.';
  }

  if (argv.crux && argv.crux.key && argv.multi) {
    return 'Error: Getting CrUx data do not work running in multi mode.';
  }

  if (
    argv.urlAlias &&
    argv._ &&
    getURLs(argv._).length !== toArray(argv.urlAlias).length
  ) {
    return 'Error: You have a miss match between number of alias and URLs.';
  }

  if (
    argv.groupAlias &&
    argv._ &&
    getURLs(argv._).length !== toArray(argv.groupAlias).length
  ) {
    return 'Error: You have a miss match between number of alias for groups and URLs.';
  }

  if (
    argv.browsertime.connectivity &&
    argv.browsertime.connectivity.engine === 'humble' &&
    (!argv.browsertime.connectivity.humble ||
      !argv.browsertime.connectivity.humble.url)
  ) {
    return 'You need to specify the URL to Humble by using the --browsertime.connectivity.humble.url option.';
  }

  if (
    argv.browsertime.safari &&
    argv.browsertime.safari.useSimulator &&
    argv.browsertime.docker
  ) {
    return 'You cannot use Safari simulator in Docker. You need to run on directly on Mac OS.';
  }

  if (
    argv.browsertime.safari &&
    argv.browsertime.safari.useSimulator &&
    !argv.browsertime.safari.deviceUDID
  ) {
    return 'You need to specify the --safari.deviceUDID when you run the simulator. Run "xcrun simctl list devices" in your terminal to list all devices.';
  }

  if (argv.browsertime.debug && argv.browsertime.browser === 'safari') {
    return 'Debug mode do not work in Safari. Please try with Firefox/Chrome or Edge';
  }

  if (argv.browsertime.debug && argv.android) {
    return 'Debug mode do not work on Android. Please run debug mode on Desktop.';
  }

  if (argv.browsertime.debug && argv.docker) {
    return 'There is no benefit running debug mode inside a Docker container.';
  }

  // If we ask the API for finished test, we don't need a URL
  if (argv._.length === 0 && !argv.api.id) {
    return 'You need to supply one/multiple URLs or scripts';
  }

  // validate URLs/files
  const urlOrFiles = argv._;
  for (let urlOrFile of urlOrFiles) {
    if (!urlOrFile.startsWith('http')) {
      // is existing file?
      try {
        statSync(urlOrFile);
      } catch {
        return (
          'Error: ' +
          urlOrFile +
          ' does not exist, is the path to the file correct?'
        );
      }
    }
  }

  for (let metric of toArray(argv.html.pageSummaryMetrics)) {
    const [m, k] = metric.split('.');
    if (
      !metricList.some(
        tools => friendlynames[tools][m] && friendlynames[tools][m][k]
      )
    ) {
      return 'Error: Require summary page metrics to be from given array';
    }
  }

  for (let metric of toArray(argv.html.summaryBoxes)) {
    if (!htmlConfig.html.summaryBoxes.includes(metric)) {
      return `Error: ${metric} is not part of summary box metric.`;
    }
  }

  if (argv.html && argv.html.summaryBoxesThresholds) {
    try {
      const box = readFileSync(path.resolve(argv.html.summaryBoxesThresholds), {
        encoding: 'utf8'
      });
      argv.html.summaryBoxesThresholds = JSON.parse(box);
    } catch (error) {
      return (
        'Error: Could not read ' +
        argv.html.summaryBoxesThresholds +
        ' ' +
        error
      );
    }
  }

  return true;
}

export async function parseCommandLine() {
  let yargsInstance = yargs(hideBin(process.argv));
  let parsed = yargsInstance
    .parserConfiguration({ 'deep-merge-config': true })
    .env('SITESPEED_IO')
    .usage('$0 [options] <url>/<file>')

    .option('debugMessages', {
      default: false,
      describe:
        'Debug mode logs all internal messages in the message queue to the log.',
      type: 'boolean'
    })
    .option('verbose', {
      alias: ['v'],
      describe:
        'Verbose mode prints progress messages to the console. Enter up to three times (-vvv)' +
        ' to increase the level of detail.',
      type: 'count'
    })
    /*
     Browsertime cli options
     */
    .option('browsertime.browser', {
      alias: ['b', 'browser'],
      default: browsertimeConfig.browser,
      describe:
        'Choose which Browser to use when you test. Safari only works on Mac OS X and iOS 13 (or later).',
      choices: ['chrome', 'firefox', 'safari', 'edge'],
      group: 'Browser'
    })
    .option('browsertime.iterations', {
      alias: 'n',
      default: browsertimeConfig.iterations,
      describe: 'How many times you want to test each page',
      group: 'Browser'
    })
    .option('browsertime.xvfb', {
      alias: 'xvfb',
      type: 'boolean',
      default: false,
      describe: 'Start xvfb before the browser is started'
    })
    .option('browsertime.xvfbParams.display', {
      alias: 'xvfbParams.display',
      default: 99,
      describe: 'The display used for xvfb'
    })
    .option('browsertime.spa', {
      alias: 'spa',
      describe:
        'Convenient parameter to use if you test a SPA application: will automatically wait for X seconds after last network activity and use hash in file names. Read https://www.sitespeed.io/documentation/sitespeed.io/spa/',
      type: 'boolean',
      default: false,
      group: 'Browser'
    })
    .option('browsertime.debug', {
      alias: 'debug',
      type: 'boolean',
      default: false,
      describe:
        'Run Browsertime in debug mode. Use commands.breakpoint(name) to set breakpoints in your script. Debug mode works for Firefox/Chrome/Edge on desktop.',
      group: 'Browser'
    })
    .option('browsertime.limitedRunData', {
      type: 'boolean',
      default: true,
      describe: 'Send only limited metrics from one run to the datasource.',
      group: 'Browser'
    })
    .option('browsertime.android.gnirehtet', {
      alias: ['gnirehtet', 'browsertime.gnirehtet'],
      type: 'boolean',
      default: false,
      describe:
        'Start gnirehtet and reverse tethering the traffic from your Android phone.',
      group: 'Android'
    })
    .option('browsertime.connectivity.profile', {
      alias: 'c',
      default: browsertimeConfig.connectivity.profile,
      choices: [
        '4g',
        '3g',
        '3gfast',
        '3gslow',
        '3gem',
        '2g',
        'cable',
        'native',
        'custom'
      ],
      describe:
        'The connectivity profile. To actually set the connectivity you can choose between Docker networks or Throttle, read https://www.sitespeed.io/documentation/sitespeed.io/connectivity/',
      type: 'string',
      group: 'Browser'
    })
    .option('browsertime.connectivity.alias', {
      describe: 'Give your connectivity profile a custom name',
      type: 'string',
      group: 'Browser'
    })
    .option('browsertime.connectivity.down', {
      default: browsertimeConfig.connectivity.downstreamKbps,
      alias: ['downstreamKbps', 'browsertime.connectivity.downstreamKbps'],
      describe: 'This option requires --connectivity be set to "custom".',
      group: 'Browser'
    })
    .option('browsertime.connectivity.up', {
      default: browsertimeConfig.connectivity.upstreamKbps,
      alias: ['upstreamKbps', 'browsertime.connectivity.upstreamKbps'],
      describe: 'This option requires --connectivity be set to "custom".',
      group: 'Browser'
    })
    .option('browsertime.connectivity.rtt', {
      default: browsertimeConfig.connectivity.latency,
      alias: ['latency', 'browsertime.connectivity.latency'],
      describe: 'This option requires --connectivity be set to "custom".',
      group: 'Browser'
    })
    .option('browsertime.connectivity.engine', {
      alias: 'connectivity.engine',
      default: 'external',
      choices: ['external', 'throttle', 'humble'],
      describe:
        'The engine for connectivity. Throttle works on Mac and tc based Linux. For mobile you can use Humble if you have a Humble setup. Use external if you set the connectivity outside of Browsertime. More documentation at https://www.sitespeed.io/documentation/sitespeed.io/connectivity/.',
      type: 'string',
      group: 'Browser'
    })
    .option('browsertime.connectivity.humble.url', {
      alias: 'connectivity.humble.url',
      type: 'string',
      describe:
        'The path to your Humble instance. For example http://raspberrypi:3000',
      group: 'Browser'
    })
    .option('browsertime.timeouts.pageCompleteCheck', {
      alias: 'maxLoadTime',
      default: 120_000,
      type: 'number',
      describe:
        'The max load time to wait for a page to finish loading (in milliseconds).',
      group: 'Browser'
    })
    .option('browsertime.pageCompleteCheck', {
      alias: 'pageCompleteCheck',
      describe:
        'Supply a JavaScript that decides when the browser is finished loading the page and can start to collect metrics. The JavaScript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true). Checkout https://www.sitespeed.io/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test ',
      group: 'Browser'
    })
    .option('browsertime.pageCompleteWaitTime', {
      alias: 'pageCompleteWaitTime',
      describe:
        'How long time you want to wait for your pageCompleteCheck to finish, after it is signaled to closed. Extra parameter passed on to your pageCompleteCheck.',
      default: 5000,
      group: 'Browser'
    })
    .option('browsertime.pageCompleteCheckInactivity', {
      alias: 'pageCompleteCheckInactivity',
      describe:
        'Alternative way to choose when to end your test. This will wait for 2 seconds of inactivity that happens after loadEventEnd.',
      type: 'boolean',
      default: false,
      group: 'Browser'
    })
    .option('browsertime.pageCompleteCheckPollTimeout', {
      alias: 'pageCompleteCheckPollTimeout',
      type: 'number',
      default: 1500,
      describe:
        'The time in ms to wait for running the page complete check the next time.',
      group: 'Browser'
    })
    .option('browsertime.pageCompleteCheckStartWait', {
      alias: 'pageCompleteCheckStartWait',
      type: 'number',
      default: 500,
      describe:
        'The time in ms to wait for running the page complete check for the first time. Use this when you have a pageLoadStrategy set to none',
      group: 'Browser'
    })
    .option('browsertime.pageCompleteCheckNetworkIdle', {
      alias: 'pageCompleteCheckNetworkIdle',
      type: 'boolean',
      default: false,
      describe:
        'Use the network log instead of running JavaScript to decide when to end the test. This will wait for 5 seconds of no network activity before it ends the test. This can be used with Chrome/Edge and Firefox.',
      group: 'Browser'
    })
    .option('browsertime.pageLoadStrategy', {
      alias: 'pageLoadStrategy',
      type: 'string',
      default: 'none',
      choices: ['eager', 'none', 'normal'],
      describe:
        'Set the strategy to waiting for document readiness after a navigation event. After the strategy is ready, your pageCompleteCheck will start running. This only work for Firefox and Chrome and please check which value each browser implements.',
      group: 'Browser'
    })
    .option('browsertime.script', {
      describe:
        'Add custom Javascript that collect metrics and run after the page has finished loading. Note that --script can be passed multiple times if you want to collect multiple metrics. The metrics will automatically be pushed to the summary/detailed summary and each individual page + sent to Graphite/InfluxDB.',
      alias: ['script'],
      group: 'Browser'
    })
    .option('browsertime.injectJs', {
      describe:
        'Inject JavaScript into the current page at document_start. More info: https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts',
      alias: ['injectJs'],
      group: 'Browser'
    })
    .option('browsertime.selenium.url', {
      describe:
        'Configure the path to the Selenium server when fetching timings using browsers. If not configured the supplied NodeJS/Selenium version is used.',
      group: 'Browser'
    })
    .option('browsertime.viewPort', {
      alias: 'viewPort',
      default: browsertimeConfig.viewPort,
      describe: 'The browser view port size WidthxHeight like 400x300',
      group: 'Browser'
    })
    .option('browsertime.userAgent', {
      alias: 'userAgent',
      describe:
        'The full User Agent string, defaults to the User Agent used by the browsertime.browser option.',
      group: 'Browser'
    })
    .option('browsertime.appendToUserAgent', {
      alias: 'appendToUserAgent',
      describe:
        'Append a String to the user agent. Works in Chrome/Edge and Firefox.',
      group: 'Browser'
    })
    .option('browsertime.preURL', {
      alias: 'preURL',
      describe:
        'A URL that will be accessed first by the browser before the URL that you wanna analyse. Use it to fill the cache.',
      group: 'Browser'
    })
    .option('browsertime.preScript', {
      alias: 'preScript',
      describe:
        'Selenium script(s) to run before you test your URL. They will run outside of the analyse phase. Note that --preScript can be passed multiple times.',
      group: 'Browser'
    })
    .option('browsertime.postScript', {
      alias: 'postScript',
      describe:
        'Selenium script(s) to run after you test your URL. They will run outside of the analyse phase. Note that --postScript can be passed multiple times.',
      group: 'Browser'
    })
    .option('browsertime.delay', {
      alias: 'delay',
      describe:
        'Delay between runs, in milliseconds. Use it if your web server needs to rest between runs :)',
      group: 'Browser'
    })
    .option('browsertime.visualMetrics', {
      alias: ['visualMetrics', 'speedIndex'],
      type: 'boolean',
      describe:
        'Calculate Visual Metrics like SpeedIndex, First Visual Change and Last Visual Change. Requires FFMpeg and Python dependencies',
      group: 'Browser'
    })
    .option('browsertime.visualMetricsPerceptual', {
      alias: ['visualMetricsPerceptual'],
      type: 'boolean',
      describe: 'Collect Perceptual Speed Index when you run --visualMetrics.',
      group: 'Browser'
    })
    .option('browsertime.visualMetricsContentful', {
      alias: ['visualMetricsContentful'],
      type: 'boolean',
      describe: 'Collect Contentful Speed Index when you run --visualMetrics.',
      group: 'Browser'
    })
    .option('browsertime.visualMetricsPortable', {
      type: 'boolean',
      default: true,
      describe:
        'Use the portable visual-metrics processing script (no ImageMagick dependencies).'
    })
    .option('browsertime.visualElements', {
      type: 'boolean',
      alias: ['visualElements'],
      describe:
        'Collect Visual Metrics from elements. Works only with --visualMetrics turned on. By default you will get visual metrics from the largest image within the view port and the largest h1. You can also configure to pickup your own defined elements with --scriptInput.visualElements',
      group: 'Browser'
    })
    .option('browsertime.scriptInput.visualElements', {
      alias: ['scriptInput.visualElements'],
      describe:
        'Include specific elements in visual elements. Give the element a name and select it with document.body.querySelector. Use like this: --scriptInput.visualElements name:domSelector . Add multiple instances to measure multiple elements. Visual Metrics will use these elements and calculate when they are visible and fully rendered.',
      group: 'Browser'
    })
    .option('browsertime.scriptInput.longTask', {
      alias: 'minLongTaskLength',
      description:
        'Set the minimum length of a task to be categorised as a CPU Long Task. It can never be smaller than 50. The value is in ms and you make Browsertime collect long tasks using --chrome.collectLongTasks or --cpu.',
      type: 'number',
      default: 50,
      group: 'Browser'
    })
    .option('browsertime.video', {
      alias: 'video',
      type: 'boolean',
      describe:
        'Record a video and store the video. Set it to false to remove the video that is created by turning on visualMetrics. To remove fully turn off video recordings, make sure to set video and visualMetrics to false. Requires FFMpeg to be installed.',
      group: 'Browser'
    })
    .option('browsertime.videoParams.framerate', {
      alias: ['videoParams.framerate', 'fps'],
      default: 30,
      describe: 'Frames per second in the video',
      group: 'Browser'
    })
    .option('browsertime.videoParams.crf', {
      alias: 'videoParams.crf',
      default: 23,
      describe:
        'Constant rate factor for the end result video, see https://trac.ffmpeg.org/wiki/Encode/H.264#crf',
      group: 'Browser'
    })
    .option('browsertime.videoParams.addTimer', {
      alias: 'videoParams.addTimer',
      default: true,
      type: 'boolean',
      describe: 'Add timer and metrics to the video',
      group: 'Browser'
    })
    .option('browsertime.videoParams.convert', {
      alias: 'videoParams.convert',
      type: 'boolean',
      default: true,
      describe:
        'Convert the original video to a viewable format (for most video players). Turn that off to make a faster run.',
      group: 'Browser'
    })
    .option('browsertime.videoParams.keepOriginalVideo', {
      alias: 'videoParams.keepOriginalVideo',
      type: 'boolean',
      default: false,
      describe:
        'Keep the original video. Use it when you have a Visual Metrics bug and want to create an issue at GitHub. Supply the original video in the issue and we can reproduce your issue.',
      group: 'video'
    })
    .option('browsertime.cpu', {
      alias: 'cpu',
      type: 'boolean',
      describe:
        'Easy way to enable both chrome.timeline and CPU long tasks for Chrome and geckoProfile for Firefox',
      group: 'Browser'
    })
    .option('browsertime.enableProfileRun', {
      alias: 'enableProfileRun',
      type: 'boolean',
      describe:
        'Make one extra run that collects the profiling trace log (no other metrics is collected). For Chrome it will collect the timeline trace, for Firefox it will get the Geckoprofiler trace. This means you do not need to get the trace for all runs and can skip the overhead it produces.'
    })
    .option('browsertime.enableVideoRun', {
      alias: 'enableVideoRun',
      type: 'boolean',
      describe:
        'Make one extra run that collects video and visual metrics. This means you can do your runs with --visualMetrics true --video false --enableVideoRun true to collect visual metrics from all runs and save a video from the profile/video run. If you run it together with --enableProfileRun it will also collect profiling trace.'
    })
    .option('browsertime.videoParams.filmstripFullSize', {
      alias: 'videoParams.filmstripFullSize',
      type: 'boolean',
      default: false,
      describe:
        'Keep original sized screenshots in the filmstrip. Will make the run take longer time',
      group: 'Filmstrip'
    })
    .option('browsertime.videoParams.filmstripQuality', {
      alias: 'videoParams.filmstripQuality',
      default: 75,
      describe: 'The quality of the filmstrip screenshots. 0-100.',
      group: 'Filmstrip'
    })
    .option('browsertime.videoParams.createFilmstrip', {
      alias: 'videoParams.createFilmstrip',
      type: 'boolean',
      default: true,
      describe: 'Create filmstrip screenshots.',
      group: 'Filmstrip'
    })
    .option('browsertime.videoParams.thumbsize', {
      alias: 'videoParams.thumbsize',
      default: 400,
      describe:
        'The maximum size of the thumbnail in the filmstrip. Default is 400 pixels in either direction. If browsertime.videoParams.filmstripFullSize is used that setting overrides this.',
      group: 'Filmstrip'
    })
    .option('filmstrip.showAll', {
      type: 'boolean',
      default: false,
      describe:
        'Show all screenshots in the filmstrip, independent if they have changed or not.',
      group: 'Filmstrip'
    })
    .option('browsertime.userTimingWhitelist', {
      alias: 'userTimingWhitelist',
      describe:
        'This option takes a regex that will whitelist which userTimings to capture in the results. All userTimings are captured by default. T',
      group: 'Browser'
    })
    .option('axe.enable', {
      type: 'boolean',
      describe:
        'Run axe tests. Axe will run after all other metrics is collected and will add some extra time to each test.',
      group: 'Browser'
    })
    .option('browsertime.cjs', {
      alias: 'cjs',
      describe:
        'Load scripting files that ends with .js as common js. Default (false) loads files as esmodules.',
      type: 'boolean',
      default: false
    })
    .option('browsertime.tcpdump', {
      alias: 'tcpdump',
      type: 'boolean',
      default: false,
      describe:
        'Collect a tcpdump for each tested URL. The user that runs sitespeed.io should have sudo rights for tcpdump to work.'
    })
    .option('browsertime.firefox.includeResponseBodies', {
      alias: 'firefox.includeResponseBodies',
      describe: 'Include response bodies in HAR',
      default: 'none',
      choices: ['none', 'all', 'html'],
      group: 'Firefox'
    })
    .option('browsertime.firefox.nightly', {
      alias: 'firefox.nightly',
      describe:
        'Use Firefox Nightly. Works on OS X. For Linux you need to set the binary path.',
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.beta', {
      alias: 'firefox.beta',
      describe:
        'Use Firefox Beta. Works on OS X. For Linux you need to set the binary path.',
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.developer', {
      alias: 'firefox.developer',
      describe:
        'Use Firefox Developer. Works on OS X. For Linux you need to set the binary path.',
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.binaryPath', {
      alias: 'firefox.binaryPath',
      describe:
        'Path to custom Firefox binary (e.g. Firefox Nightly). ' +
        'On OS X, the path should be to the binary inside the app bundle, ' +
        'e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin',
      group: 'Firefox'
    })
    .option('browsertime.firefox.preference', {
      alias: 'firefox.preference',
      describe:
        'Extra command line arguments to pass Firefox preferences by the format key:value ' +
        'To add multiple preferences, repeat --firefox.preference once per argument.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.acceptInsecureCerts', {
      alias: 'firefox.acceptInsecureCerts',
      describe: 'Accept insecure certs',
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.memoryReport', {
      alias: 'firefox.memoryReport',
      describe: 'Measure firefox resident memory after each iteration.',
      default: false,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.memoryReportParams.minizeFirst', {
      alias: 'firefox.memoryReportParams.minizeFirst',
      describe:
        'Force a collection before dumping and measuring the memory report.',
      default: false,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckoProfiler', {
      alias: 'firefox.geckoProfiler',
      describe: 'Collect a profile using the internal gecko profiler',
      default: false,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckoProfilerParams.features', {
      alias: 'firefox.geckoProfilerParams.features',
      describe: 'Enabled features during gecko profiling',
      default: 'js,stackwalk,leaf',
      type: 'string',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckoProfilerParams.threads', {
      alias: 'firefox.geckoProfilerParams.threads',
      describe: 'Threads to profile.',
      default: 'GeckoMain,Compositor,Renderer',
      type: 'string',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckoProfilerParams.interval', {
      alias: 'firefox.geckoProfilerParams.interval',
      describe: `Sampling interval in ms.  Defaults to 1 on desktop, and 4 on android.`,
      type: 'number',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckoProfilerParams.bufferSize', {
      alias: 'firefox.geckoProfilerParams.bufferSize',
      describe: 'Buffer size in elements. Default is ~90MB.',
      default: 1_000_000,
      type: 'number',
      group: 'Firefox'
    })
    .option('browsertime.firefox.powerConsumption', {
      alias: 'firefox.powerConsumption',
      type: 'boolean',
      default: false,
      describe:
        'Enable power consumption collection (in Wh). To get the consumption you also need to set firefox.geckoProfilerParams.features to include power.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckodriverArgs', {
      alias: 'firefox.geckodriverArgs',
      describe:
        'Flags passed to Geckodriver see https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html. Use it like --firefox.geckodriverArgs="--marionette-port"  --firefox.geckodriverArgs=1027 ',
      type: 'string',
      group: 'Firefox'
    })
    .option('browsertime.firefox.windowRecorder', {
      alias: 'firefox.windowRecorder',
      describe:
        'Use the internal compositor-based Firefox window recorder to emit PNG files for each ' +
        'frame that is a meaningful change.  The PNG output will further be merged into a ' +
        'variable frame rate video for analysis. Use this instead of ffmpeg to record a video (you still need the --video flag).',
      default: false,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.disableSafeBrowsing', {
      alias: 'firefox.disableSafeBrowsing',
      describe: 'Disable safebrowsing.',
      default: true,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.disableTrackingProtection', {
      alias: 'firefox.disableTrackingProtection',
      describe: 'Disable Tracking Protection.',
      default: true,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.android.package', {
      alias: 'firefox.android.package',
      describe:
        'Run Firefox or a GeckoView-consuming App on your Android device. Set to org.mozilla.geckoview_example for default Firefox version. You need to have adb installed to make this work.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.android.activity', {
      alias: 'firefox.android.activity',
      describe: 'Name of the Activity hosting the GeckoView.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.android.deviceSerial', {
      alias: 'firefox.android.deviceSerial',
      type: 'string',
      describe:
        'Choose which device to use. If you do not set it, first device will be used.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.android.intentArgument', {
      alias: 'firefox.android.intentArgument',
      describe:
        'Configure how the Android intent is launched.  Passed through to `adb shell am start ...`; ' +
        'follow the format at https://developer.android.com/studio/command-line/adb#IntentSpec. ' +
        'To add multiple arguments, repeat --firefox.android.intentArgument once per argument.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.profileTemplate', {
      alias: 'firefox.profileTemplate',
      describe:
        'Profile template directory that will be cloned and used as the base of each profile each instance of Firefox is launched against.  Use this to pre-populate databases with certificates, tracking protection lists, etc.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.collectMozLog', {
      alias: 'firefox.collectMozLog',
      type: 'boolean',
      describe: 'Collect the MOZ HTTP log',
      group: 'Firefox'
    })
    .option('browsertime.chrome.args', {
      alias: 'chrome.args',
      describe:
        'Extra command line arguments to pass to the Chrome process. If you use the command line, leave out the starting -- (--no-sandbox will be no-sandbox). If you use a configuration JSON file you should keep the starting --. ' +
        'To add multiple arguments to Chrome, repeat --browsertime.chrome.args once per argument. See https://peter.sh/experiments/chromium-command-line-switches/',
      group: 'Chrome'
    })
    .option('browsertime.chrome.timeline', {
      alias: 'chrome.timeline',
      describe:
        'Collect the timeline data. Drag and drop the JSON in your Chrome detvools timeline panel or check out the CPU metrics.',
      type: 'boolean',
      default: false,
      group: 'Chrome'
    })
    .option('browsertime.chrome.appendToUserAgent', {
      alias: 'chrome.appendToUserAgent',
      type: 'string',
      describe: 'Append to the user agent.',
      group: 'Chrome'
    })
    .option('browsertime.chrome.android.package', {
      alias: 'chrome.android.package',
      describe:
        'Run Chrome on your Android device. Set to com.android.chrome for default Chrome version. You need to have adb installed to run on Android.',
      group: 'Chrome'
    })
    .option('browsertime.chrome.android.activity', {
      alias: 'chrome.android.activity',
      describe: 'Name of the Activity hosting the WebView.',
      group: 'Chrome'
    })
    .option('browsertime.chrome.android.process', {
      alias: 'chrome.android.process',
      describe:
        'Process name of the Activity hosting the WebView. If not given, the process name is assumed to be the same as chrome.android.package.',
      group: 'Chrome'
    })
    .option('browsertime.android', {
      alias: 'android',
      type: 'boolean',
      default: false,
      describe:
        'Short key to use Android. Will automatically use com.android.chrome for Chrome and stable Firefox. If you want to use another Chrome version, use --chrome.android.package'
    })
    .option('browsertime.android.rooted', {
      alias: ['androidRooted', 'browsertime.androidRooted'],
      type: 'boolean',
      default: false,
      describe:
        'If your phone is rooted you can use this to set it up following Mozillas best practice for stable metrics.',
      group: 'Android'
    })
    .option('browsertime.android.batteryTemperatureLimit', {
      alias: [
        'androidBatteryTemperatureLimit',
        'browsertime.androidBatteryTemperatureLimit'
      ],
      type: 'integer',
      describe:
        'Do the battery temperature need to be below a specific limit before we start the test?',
      group: 'Android'
    })
    .option('browsertime.android.batteryTemperatureWaitTimeInSeconds', {
      alias: [
        'androidBatteryTemperatureWaitTimeInSeconds',
        'browsertime.androidBatteryTemperatureWaitTimeInSeconds'
      ],
      type: 'integer',
      default: 120,
      describe:
        'How long time to wait (in seconds) if the androidBatteryTemperatureWaitTimeInSeconds is not met before the next try',
      group: 'Android'
    })
    .option('browsertime.android.verifyNetwork', {
      alias: ['androidVerifyNetwork', 'browsertime.androidVerifyNetwork'],
      type: 'boolean',
      default: false,
      describe:
        'Before a test start, verify that the device has a Internet connection by pinging 8.8.8.8 (or a configurable domain with --androidPingAddress)',
      group: 'Android'
    })
    .option('browsertime.chrome.android.deviceSerial', {
      alias: 'chrome.android.deviceSerial',
      type: 'string',
      describe:
        'Choose which device to use. If you do not set it, the first found device will be used.',
      group: 'Chrome'
    })
    .option('browsertime.chrome.collectNetLog', {
      alias: 'chrome.collectNetLog',
      type: 'boolean',
      describe: 'Collect network log from Chrome and save to disk.',
      group: 'Chrome'
    })
    .option('browsertime.chrome.traceCategories', {
      alias: 'chrome.traceCategories',
      describe: 'Set the trace categories.',
      type: 'string',
      group: 'Chrome'
    })
    .option('browsertime.chrome.traceCategory', {
      alias: 'chrome.traceCategory',
      describe:
        'Add a trace category to the default ones. Use --chrome.traceCategory multiple times if you want to add multiple categories. Example: --chrome.traceCategory disabled-by-default-v8.cpu_profiler',
      type: 'string',
      group: 'Chrome'
    })
    .option('browsertime.chrome.enableTraceScreenshots', {
      alias: 'chrome.enableTraceScreenshots',
      describe:
        'Include screenshots in the trace log (enabling the trace category disabled-by-default-devtools.screenshot).',
      type: 'boolean',
      group: 'Chrome'
    })
    .option('browsertime.chrome.collectConsoleLog', {
      alias: 'chrome.collectConsoleLog',
      type: 'boolean',
      describe: 'Collect Chromes console log and save to disk.',
      group: 'Chrome'
    })
    .option('browsertime.chrome.binaryPath', {
      alias: 'chrome.binaryPath',
      describe:
        'Path to custom Chrome binary (e.g. Chrome Canary). ' +
        'On OS X, the path should be to the binary inside the app bundle, ' +
        'e.g. "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"',
      group: 'Chrome'
    })
    .option('browsertime.chrome.chromedriverPath', {
      alias: 'chrome.chromedriverPath',
      describe:
        "Path to custom ChromeDriver binary. Make sure to use a ChromeDriver version that's compatible with " +
        "the version of Chrome you're using",
      group: 'Chrome'
    })
    .option('browsertime.chrome.cdp.performance', {
      alias: 'chrome.cdp.performance',
      type: 'boolean',
      default: true,
      describe:
        'Collect Chrome performance metrics from Chrome DevTools Protocol',
      group: 'Chrome'
    })
    .option('browsertime.chrome.collectLongTasks', {
      alias: 'chrome.collectLongTasks',
      type: 'boolean',
      describe: 'Collect CPU long tasks, using the Long Task API',
      group: 'Chrome'
    })
    .option('browsertime.chrome.CPUThrottlingRate', {
      alias: 'chrome.CPUThrottlingRate',
      type: 'number',
      describe:
        'Enables CPU throttling to emulate slow CPUs. Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc)',
      group: 'Chrome'
    })
    .option('browsertime.chrome.ignoreCertificateErrors', {
      alias: 'chrome.ignoreCertificateErrors',
      type: 'boolean',
      default: true,
      describe: 'Make Chrome ignore certificate errors.  Defaults to true.',
      group: 'Chrome'
    })
    .option('thirdParty.cpu', {
      type: 'boolean',
      describe:
        'Enable CPU time spent data to Graphite/Grafana per third party tool.',
      group: 'Chrome'
    })
    .option('browsertime.chrome.includeResponseBodies', {
      alias: 'chrome.includeResponseBodies',
      describe: 'Include response bodies in the HAR file.',
      default: 'none',
      choices: ['none', 'html', 'all'],
      group: 'Chrome'
    })
    .option('browsertime.chrome.blockDomainsExcept', {
      alias: 'chrome.blockDomainsExcept',
      describe:
        'Block all domains except this domain. Use it multiple time to keep multiple domains. You can also wildcard domains like *.sitespeed.io. Use this when you wanna block out all third parties.',
      group: 'Chrome'
    })
    .option('browsertime.edge.edgedriverPath', {
      alias: 'edge.edgedriverPath',
      describe: 'To run Edge you need to supply the path to the msedgedriver',
      group: 'Edge'
    })
    .option('browsertime.edge.binaryPath', {
      alias: 'edge.binaryPath',
      describe: 'Path to custom Edge binary',
      group: 'Edge'
    })
    .option('browsertime.safari.ios', {
      alias: 'safari.ios',
      default: false,
      describe:
        'Use Safari on iOS. You need to choose browser Safari and iOS to run on iOS. Only works on OS X Catalina and iOS 13 (and later).',
      type: 'boolean',
      group: 'Safari'
    })
    .option('browsertime.safari.deviceName', {
      alias: 'safari.deviceName',
      describe:
        'Set the device name. Device names for connected devices are shown in iTunes.',
      group: 'Safari'
    })
    .option('browsertime.safari.deviceUDID', {
      alias: 'safari.deviceUDID',
      describe:
        'Set the device UDID. If Xcode is installed, UDIDs for connected devices are available via the output of "xcrun simctl list devices" and in the Device and Simulators window (accessed in Xcode via "Window > Devices and Simulators")',
      group: 'Safari'
    })
    .option('browsertime.safari.deviceType', {
      alias: 'safari.deviceType',
      describe:
        'Set the device type. If the value of safari:deviceType is `iPhone`, safaridriver will only create a session using an iPhone device or iPhone simulator. If the value of safari:deviceType is `iPad`, safaridriver will only create a session using an iPad device or iPad simulator.',
      group: 'Safari'
    })
    .option('browsertime.safari.useTechnologyPreview', {
      alias: 'safari.useTechnologyPreview',
      type: 'boolean',
      default: false,
      describe: 'Use Safari Technology Preview',
      group: 'Safari'
    })
    .option('browsertime.safari.diagnose', {
      alias: 'safari.diagnose',
      describe:
        'When filing a bug report against safaridriver, it is highly recommended that you capture and include diagnostics generated by safaridriver. Diagnostic files are saved to ~/Library/Logs/com.apple.WebDriver/',
      group: 'Safari'
    })
    .option('browsertime.safari.useSimulator', {
      alias: 'safari.useSimulator',
      describe:
        'If the value of useSimulator is true, safaridriver will only use iOS Simulator hosts. If the value of safari:useSimulator is false, safaridriver will not use iOS Simulator hosts. NOTE: An Xcode installation is required in order to run WebDriver tests on iOS Simulator hosts.',
      default: false,
      type: 'boolean',
      group: 'Safari'
    })
    .option('browsertime.requestheader', {
      alias: ['r', 'requestheader'],
      describe:
        'Request header that will be added to the request. Add multiple instances to add multiple request headers. Use the following format key:value. Only works in Chrome, Firefox and Edge.',
      group: 'Browser'
    })
    .option('browsertime.cookie', {
      alias: ['cookie'],
      group: 'Browser',
      describe:
        'Cookie that will be added to the request. Add multiple instances to add multiple cookies. Use the following format cookieName=cookieValue. Only works in Chrome and Firefox.'
    })
    .option('browsertime.block', {
      alias: 'block',
      describe:
        'Domain or URL or URL pattern to block. If you use Chrome you can also use --blockDomainsExcept (that is more performant). Works in Chrome/Edge. For Firefox you can only block domains.',
      group: 'Browser'
    })
    .option('browsertime.basicAuth', {
      describe:
        'Use it if your server is behind Basic Auth. Format: username@password. Only works in Chrome and Firefox.',
      group: 'Browser',
      alias: 'basicAuth'
    })
    .option('browsertime.proxy.http', {
      alias: 'proxy.http',
      type: 'string',
      describe: 'Http proxy (host:port)',
      group: 'proxy'
    })
    .option('browsertime.proxy.https', {
      alias: 'proxy.https',
      type: 'string',
      describe: 'Https proxy (host:port)',
      group: 'proxy'
    })
    .option('browsertime.flushDNS', {
      alias: 'flushDNS',
      describe:
        'Flush the DNS between runs (works on Mac OS and Linux). The user needs sudo rights to flush the DNS.',
      group: 'Browser'
    })
    .option('browsertime.headless', {
      alias: 'headless',
      type: 'boolean',
      default: false,
      group: 'Browser',
      describe:
        'Run the browser in headless mode. This is the browser internal headless mode, meaning you cannot collect Visual Metrics or in Chrome run any WebExtension (this means you cannot add cookies, requestheaders or use basic auth for headless Chrome). Only works in Chrome and Firefox.'
    })
    .option('browsertime.iqr', {
      describe:
        'Use IQR, or Inter Quartile Range filtering filters data based on the spread of the data. See  https://en.wikipedia.org/wiki/Interquartile_range. In some cases, IQR filtering may not filter out anything. This can happen if the acceptable range is wider than the bounds of your dataset. ',
      type: 'boolean',
      default: false
    })
    .option('browsertime.preWarmServer', {
      alias: 'preWarmServer',
      type: 'boolean',
      default: false,
      describe:
        'Do pre test requests to the URL(s) that you want to test that is not measured. Do that to make sure your web server is ready to serve. The pre test requests is done with another browser instance that is closed after pre testing is done.'
    })
    .option('browsertime.preWarmServerWaitTime', {
      type: 'number',
      default: 5000,
      describe:
        'The wait time before you start the real testing after your pre-cache request.'
    })
    /*
   Crawler options
   */
    .option('crawler.depth', {
      alias: 'd',
      describe:
        'How deep to crawl (1=only one page, 2=include links from first page, etc.)',
      group: 'Crawler'
    })
    .option('crawler.maxPages', {
      alias: 'm',
      describe: 'The max number of pages to test. Default is no limit.',
      group: 'Crawler'
    })
    .option('crawler.exclude', {
      describe: String.raw`Exclude URLs matching the provided regular expression (ex: "/some/path/", "://some\.domain/"). Can be provided multiple times.`,
      group: 'Crawler'
    })
    .option('crawler.include', {
      describe: String.raw`Discard URLs not matching the provided regular expression (ex: "/some/path/", "://some\.domain/"). Can be provided multiple times.`,
      group: 'Crawler'
    })
    .option('crawler.ignoreRobotsTxt', {
      type: 'boolean',
      default: false,
      describe: 'Ignore robots.txt rules of the crawled domain.',
      group: 'Crawler'
    })

    .option('scp.host', {
      describe: 'The host.',
      group: 'scp'
    })
    .option('scp.destinationPath', {
      describe:
        'The destination path on the remote server where the files will be copied.',
      group: 'scp'
    })
    .option('scp.port', {
      default: 22,
      describe: 'The port for ssh when scp the result to another server.',
      group: 'scp'
    })
    .option('scp.username', {
      describe:
        'The username. Use username/password or username/privateKey/pem.',
      group: 'scp'
    })
    .option('scp.password', {
      describe: 'The password if you do not use a pem file.',
      group: 'scp'
    })
    .option('scp.privateKey', {
      describe: 'Path to the pem file.',
      group: 'scp'
    })
    .option('scp.passphrase', {
      describe: 'The passphrase for the pem file.',
      group: 'scp'
    })
    .option('scp.removeLocalResult', {
      default: true,
      describe:
        'Remove the files locally when the files has been copied to the other server.',
      group: 'scp'
    })

    .option('grafana.host', {
      describe: 'The Grafana host used when sending annotations.',
      group: 'Grafana'
    })

    .option('grafana.port', {
      default: 80,
      describe: 'The Grafana port used when sending annotations to Grafana.',
      group: 'Grafana'
    })
    .option('grafana.auth', {
      describe:
        'The Grafana auth/bearer value used when sending annotations to Grafana. If you do not set Bearer/Auth, Bearer is automatically set. See http://docs.grafana.org/http_api/auth/#authentication-api',
      group: 'Grafana'
    })
    .option('grafana.annotationTitle', {
      describe: 'Add a title to the annotation sent for a run.',
      group: 'Grafana'
    })
    .option('grafana.annotationMessage', {
      describe:
        'Add an extra message that will be attached to the annotation sent for a run. The message is attached after the default message and can contain HTML.',
      group: 'Grafana'
    })

    .option('grafana.annotationTag', {
      describe:
        'Add a extra tag to the annotation sent for a run. Repeat the --grafana.annotationTag option for multiple tags. Make sure they do not collide with the other tags.',
      group: 'Grafana'
    })
    .option('grafana.annotationScreenshot', {
      default: false,
      type: 'boolean',
      describe:
        'Include screenshot (from Browsertime) in the annotation. You need to specify a --resultBaseURL for this to work.',
      group: 'Grafana'
    })

    .option('graphite.host', {
      describe: 'The Graphite host used to store captured metrics.',
      group: 'Graphite'
    })
    .option('graphite.port', {
      default: 2003,
      describe: 'The Graphite port used to store captured metrics.',
      group: 'Graphite'
    })
    .option('graphite.auth', {
      describe:
        'The Graphite user and password used for authentication. Format: user:password',
      group: 'Graphite'
    })
    .option('graphite.httpPort', {
      describe:
        'The Graphite port used to access the user interface and send annotations event',
      default: 8080,
      group: 'Graphite'
    })
    .option('graphite.webHost', {
      describe:
        'The graphite-web host. If not specified graphite.host will be used.',
      group: 'Graphite'
    })
    .option('graphite.proxyPath', {
      describe:
        'Extra path to graphite-web when behind a proxy, used when sending annotations.',
      default: '',
      group: 'Graphite'
    })
    .option('graphite.namespace', {
      default: 'sitespeed_io.default',
      describe: 'The namespace key added to all captured metrics.',
      group: 'Graphite'
    })
    .option('graphite.includeQueryParams', {
      default: false,
      describe:
        'Whether to include query parameters from the URL in the Graphite keys or not',
      type: 'boolean',
      group: 'Graphite'
    })
    .option('graphite.arrayTags', {
      default: true,
      type: 'boolean',
      describe:
        'Send the tags as Array or a String. In Graphite 1.0 the tags is a array. Before a String',
      group: 'Graphite'
    })
    .option('graphite.annotationTitle', {
      describe: 'Add a title to the annotation sent for a run.',
      group: 'Graphite'
    })
    .option('graphite.annotationMessage', {
      describe:
        'Add an extra message that will be attached to the annotation sent for a run. The message is attached after the default message and can contain HTML.',
      group: 'Graphite'
    })
    .option('graphite.annotationScreenshot', {
      default: false,
      type: 'boolean',
      describe:
        'Include screenshot (from Browsertime) in the annotation. You need to specify a --resultBaseURL for this to work.',
      group: 'Graphite'
    })
    .option('graphite.sendAnnotation', {
      default: true,
      type: 'boolean',
      describe:
        'Send annotations when a run is finished. You need to specify a --resultBaseURL for this to work. However if you for example use a Prometheus exporter, you may want to make sure annotations are not sent, then set it to false.',
      group: 'Graphite'
    })
    .option('graphite.annotationRetentionMinutes', {
      type: 'number',
      describe:
        'The retention in minutes, to make annotation match the retention in Graphite.',
      group: 'Graphite'
    })
    .option('graphite.statsd', {
      default: false,
      type: 'boolean',
      describe: 'Uses the StatsD interface',
      group: 'Graphite'
    })
    .option('graphite.annotationTag', {
      describe:
        'Add a extra tag to the annotation sent for a run. Repeat the --graphite.annotationTag option for multiple tags. Make sure they do not collide with the other tags.',
      group: 'Graphite'
    })
    .option('graphite.addSlugToKey', {
      default: true,
      type: 'boolean',
      describe:
        'Add the slug (name of the test) as an extra key in the namespace.',
      group: 'Graphite'
    })
    .option('graphite.bulkSize', {
      default: undefined,
      type: 'number',
      describe: 'Break up number of metrics to send with each request.',
      group: 'Graphite'
    })
    .option('graphite.messages', {
      default: ['pageSummary', 'summary'],
      options: ['pageSummary', 'summary', 'run'],
      describe:
        'Define which messages to send to Graphite. By default we do not send data per run, but you can change that by adding run as one of the options',
      group: 'Graphite'
    })

    .option('influxdb.protocol', {
      describe: 'The protocol used to store connect to the InfluxDB host.',
      default: 'http',
      group: 'InfluxDB'
    })
    .option('influxdb.host', {
      describe: 'The InfluxDB host used to store captured metrics.',
      group: 'InfluxDB'
    })
    .option('influxdb.port', {
      default: 8086,
      describe: 'The InfluxDB port used to store captured metrics.',
      group: 'InfluxDB'
    })
    .option('influxdb.username', {
      describe:
        'The InfluxDB username for your InfluxDB instance (only for InfluxDB v1)',
      group: 'InfluxDB'
    })
    .option('influxdb.password', {
      describe:
        'The InfluxDB password for your InfluxDB instance (only for InfluxDB v1).',
      group: 'InfluxDB'
    })
    .option('influxdb.organisation', {
      describe:
        'The InfluxDB organisation for your InfluxDB instance (only for InfluxDB v2)',
      group: 'InfluxDB'
    })
    .option('influxdb.token', {
      describe:
        'The InfluxDB token for your InfluxDB instance (only for InfluxDB v2)',
      group: 'InfluxDB'
    })
    .option('influxdb.version', {
      default: 1,
      describe: 'The InfluxDB version of your InfluxDB instance.',
      type: 'integer',
      group: 'InfluxDB'
    })
    .option('influxdb.database', {
      default: 'sitespeed',
      describe: 'The database name used to store captured metrics.',
      group: 'InfluxDB'
    })
    .option('influxdb.tags', {
      default: 'category=default',
      describe:
        'A comma separated list of tags and values added to each metric',
      group: 'InfluxDB'
    })
    .option('influxdb.includeQueryParams', {
      default: false,
      describe:
        'Whether to include query parameters from the URL in the InfluxDB keys or not',
      type: 'boolean',
      group: 'InfluxDB'
    })
    .option('influxdb.groupSeparator', {
      default: '_',
      describe:
        'Choose which character that will separate a group/domain. Default is underscore, set it to a dot if you wanna keep the original domain name.',
      group: 'InfluxDB'
    })
    .option('influxdb.annotationScreenshot', {
      default: false,
      type: 'boolean',
      describe:
        'Include screenshot (from Browsertime) in the annotation. You need to specify a --resultBaseURL for this to work.',
      group: 'InfluxDB'
    });

  parsed
    /** Plugins */
    .option('plugins.list', {
      describe: 'List all configured plugins in the log.',
      type: 'boolean',
      group: 'Plugins'
    })
    .option('plugins.disable', {
      type: 'array',
      describe: false
    })
    .option('plugins.load', {
      type: 'array',
      describe: false
    })
    .option('plugins.add', {
      describe:
        'Extra plugins that you want to run. Relative or absolute path to the plugin. ' +
        'Specify multiple plugin names separated by comma, or repeat the --plugins.add option',
      group: 'Plugins'
    })
    .option('plugins.remove', {
      describe:
        'Default plugins that you not want to run. ' +
        'Specify multiple plugin names separated by comma, or repeat the --plugins.remove option',
      group: 'Plugins'
    })
    /** Budget */
    .option('budget.configPath', {
      describe: 'Path to the JSON budget file.',
      group: 'Budget'
    })
    .option('budget.suppressExitCode', {
      describe:
        'By default sitespeed.io returns a failure exit code, if the budget fails. Set this to true and sitespeed.io will return exit code 0 independent of the budget.',
      group: 'Budget'
    })
    .option('budget.config', {
      describe: 'The JSON budget config as a string.',
      group: 'Budget'
    })
    .option('budget.output', {
      choices: ['junit', 'tap', 'json'],
      describe: 'The output format of the budget.',
      group: 'Budget'
    })
    .option('budget.friendlyName', {
      describe:
        'Add a friendly name to the test case. At the moment this is only used in junit.',
      group: 'Budget'
    })
    .option('budget.removeWorkingResult', {
      alias: 'budget.removePassingResult',
      type: 'boolean',
      describe:
        'Remove the result of URLs that pass the budget. You can use this if you many URL and only care about the ones that fails your budget. All videos/HTML for the working URLs will be removed if you pass this on.',
      group: 'Budget'
    })

    /** Screenshot */
    .option('browsertime.screenshotLCP', {
      alias: 'screenshotLCP',
      type: 'boolean',
      default: true,
      describe:
        'Save one screenshot per iteration that shows the largest contentful paint element (if the browser supports LCP).',
      group: 'Screenshot'
    })
    .option('browsertime.screenshotLS', {
      alias: 'screenshotLS',
      type: 'boolean',
      default: true,
      describe:
        'Save one screenshot per iteration that shows the layout shift elements (if the browser supports layout shift).',
      group: 'Screenshot'
    })
    .option('browsertime.screenshot', {
      type: 'boolean',
      describe: 'Set to false to disable screenshots',
      default: true,
      group: 'Screenshot'
    })
    .option('browsertime.screenshotParams.type', {
      alias: 'screenshot.type',
      describe: 'Set the file type of the screenshot',
      choices: ['png', 'jpg'],
      default: browsertimeConfig.screenshotParams.type,
      group: 'Screenshot'
    })
    .option('browsertime.screenshotParams.png.compressionLevel', {
      alias: 'screenshot.png.compressionLevel',
      describe: 'zlib compression level',
      default: browsertimeConfig.screenshotParams.png.compressionLevel,
      group: 'Screenshot'
    })
    .option('browsertime.screenshotParams.jpg.quality', {
      alias: 'screenshot.jpg.quality',
      describe: 'Quality of the JPEG screenshot. 1-100',
      default: browsertimeConfig.screenshotParams.jpg.quality,
      group: 'Screenshot'
    })
    .option('browsertime.screenshotParams.maxSize', {
      alias: 'screenshot.maxSize',
      describe: 'The max size of the screenshot (width and height).',
      default: browsertimeConfig.screenshotParams.maxSize,
      group: 'Screenshot'
    });
  /**
   InfluxDB cli option
   */

  parsed
    // Metrics
    .option('metrics.list', {
      describe: 'List all possible metrics in the data folder (metrics.txt).',
      type: 'boolean',
      default: metricsConfig.list,
      group: 'Metrics'
    })
    .option('metrics.filterList', {
      describe:
        'List all configured filters for metrics in the data folder (configuredMetrics.txt)',
      type: 'boolean',
      default: metricsConfig.filterList,
      group: 'Metrics'
    })
    .option('metrics.filter', {
      type: 'array',
      describe:
        'Add/change/remove filters for metrics. If you want to send all metrics, use: *+ . If you want to remove all current metrics and send only the coach score: *- coach.summary.score.*',
      group: 'Metrics'
    })

    .option('matrix.host', {
      describe: 'The Matrix host.',
      group: 'Matrix'
    })
    .option('matrix.accessToken', {
      describe: 'The Matrix access token.',
      group: 'Matrix'
    })
    .option('matrix.room', {
      describe:
        'The default Matrix room. It is alsways used. You can override the room per message type using --matrix.rooms',
      group: 'Matrix'
    })
    .option('matrix.messages', {
      describe:
        'Choose what type of message to send to Matrix. There are two types of messages: Error messages and budget messages. Errors are errors that happens through the tests (failures like strarting a test) and budget is test failing against your budget.',
      choices: matrixMessageTypes(),
      default: matrixMessageTypes(),
      group: 'Matrix'
    })

    .option('matrix.rooms', {
      describe:
        'Send messages to different rooms. Current message types are [' +
        matrixMessageTypes +
        ']. If you want to send error messages to a specific room use --matrix.rooms.error ROOM',
      group: 'Matrix'
    })

    /**
     Slack options
     */
    .option('slack.hookUrl', {
      describe:
        'WebHook url for the Slack team (check https://<your team>.slack.com/apps/manage/custom-integrations).',
      group: 'Slack'
    })
    .option('slack.userName', {
      describe: 'User name to use when posting status to Slack.',
      default: slackConfig.userName,
      group: 'Slack'
    })
    .option('slack.channel', {
      describe:
        'The slack channel without the # (if something else than the default channel for your hook).',
      group: 'Slack'
    })
    .option('slack.type', {
      describe:
        'Send summary for a tested URL, metrics from all URLs (summary), only on errors from your tests or all to Slack.',
      default: slackConfig.type,
      choices: ['summary', 'url', 'error', 'all'],
      group: 'Slack'
    })
    .option('slack.limitWarning', {
      describe: 'The limit to get a warning in Slack using the limitMetric.',
      default: slackConfig.limitWarning,
      group: 'Slack'
    })
    .option('slack.limitError', {
      describe: 'The limit to get a error in Slack using the limitMetric.',
      default: slackConfig.limitError,
      group: 'Slack'
    })
    .option('slack.limitMetric', {
      describe:
        'The metric that will be used to set warning/error. You can choose only one at the moment.',
      default: slackConfig.limitMetric,
      choices: [
        'coachScore',
        'speedIndex',
        'firstVisualChange',
        'firstPaint',
        'visualComplete85',
        'lastVisualChange',
        'fullyLoaded'
      ],
      group: 'Slack'
    })
    /**
    S3 options
    */
    .option('s3.endpoint', {
      describe: 'The S3 endpoint. Optional depending on your settings.',
      group: 's3'
    })
    .option('s3.key', {
      describe: 'The S3 key.',
      group: 's3'
    })
    .option('s3.secret', {
      describe: 'The S3 secret.',
      group: 's3'
    })
    .option('s3.bucketname', {
      describe: 'Name of the S3 bucket,',
      group: 's3'
    })
    .option('s3.path', {
      describe:
        "Override the default folder path in the bucket where the results are uploaded. By default it's " +
        '"DOMAIN_OR_FILENAME_OR_SLUG/TIMESTAMP", or the name of the folder if --outputFolder is specified.',
      group: 's3'
    })
    .option('s3.region', {
      describe: 'The S3 region.',
      group: 's3'
    })
    .option('s3.acl', {
      describe:
        'The S3 canned ACL to set. Optional depending on your settings.',
      group: 's3'
    })
    .option('s3.removeLocalResult', {
      describe:
        'Remove all the local result files after they have been uploaded to S3.',
      default: false,
      type: 'boolean',
      group: 's3'
    })
    .option('s3.params', {
      describe:
        'Extra params passed when you do the S3.upload: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property - Example: --s3.params.Expires=31536000 to set expire to one year.',
      group: 's3'
    })
    .option('s3.options', {
      describe:
        'Extra options passed when you create the S3 object: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property - Example: add --s3.options.apiVersion=2006-03-01 to lock to a specific API version.',
      group: 's3'
    })
    /**
     Google Cloud Storage options
     */
    .option('gcs.projectId', {
      describe: 'The Google Cloud storage Project ID',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.key', {
      describe:
        'The path to the Google Cloud storage service account key JSON.',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.bucketname', {
      describe: 'Name of the Google Cloud storage bucket',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.public', {
      describe:
        'Make uploaded results to Google Cloud storage publicly readable.',
      default: false,
      type: 'boolean',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.gzip', {
      describe:
        'Add content-encoding for gzip to the uploaded files. Read more at https://cloud.google.com/storage/docs/transcoding. If you host your results directly from the bucket, gzip must be set to false',
      default: false,
      type: 'boolean',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.path', {
      describe:
        "Override the default folder path in the bucket where the results are uploaded. By default it's " +
        '"DOMAIN_OR_FILENAME_OR_SLUG/TIMESTAMP", or the name of the folder if --outputFolder is specified.',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.removeLocalResult', {
      describe:
        'Remove all the local result files after they have been uploaded to Google Cloud storage.',
      default: false,
      type: 'boolean',
      group: 'GoogleCloudStorage'
    })

    .option('crux.key', {
      describe:
        'You need to use a key to get data from CrUx. Get the key from https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started#APIKey',
      group: 'CrUx'
    })
    .option('crux.enable', {
      default: true,
      describe:
        'Enable the CrUx plugin. This is on by defauly but you also need the Crux key. If you chose to disable it with this key, set this to false and you can still use the CrUx key in your configuration.',
      group: 'CrUx'
    })
    .option('crux.formFactor', {
      default: 'ALL',
      type: 'string',
      choices: ['ALL', 'DESKTOP', 'PHONE', 'TABLET'],
      describe:
        'A form factor is the type of device on which a user visits a website.',
      group: 'CrUx'
    })
    .option('crux.collect', {
      default: 'ALL',
      type: 'string',
      choices: ['ALL', 'URL', 'ORIGIN'],
      describe:
        'Choose what data to collect. URL is data for a specific URL, ORIGIN for the domain and ALL for both of them',
      group: 'CrUx'
    })
    /**
     Html options
     */
    .option('html.showAllWaterfallSummary', {
      describe:
        'Set to true to show all waterfalls on page summary HTML report',
      default: false,
      type: 'boolean',
      group: 'HTML'
    })
    .option('html.fetchHARFiles', {
      describe:
        'Set to true to load HAR files using fetch instead of including them in the HTML. Turn this on if serve your pages using a server.',
      default: false,
      type: 'boolean',
      group: 'HTML'
    })
    .option('html.logDownloadLink', {
      describe:
        "Adds a link in the HTML so you easily can download the logs from the sitespeed.io run. If your server is public, be careful so you don't log passwords etc",
      default: false,
      type: 'boolean',
      group: 'HTML'
    })
    .option('html.topListSize', {
      describe:
        'Maximum number of assets to include in each toplist in the toplist tab',
      default: 10,
      group: 'HTML'
    })
    .option('html.showScript', {
      describe:
        'Show a link to the script you use to run. Be careful if your result is public and you keep passwords in your script.',
      default: false,
      type: 'boolean',
      group: 'HTML'
    })
    .option('html.assetsBaseURL', {
      describe:
        'The base URL to the server serving the assets of HTML results. In the format of https://result.sitespeed.io. This can be used to reduce size in large setups. If set, disables writing of assets to the output folder.',
      group: 'HTML'
    })
    .option('html.compareURL', {
      alias: 'html.compareUrl',
      describe:
        'Will add a link on the waterfall page, helping you to compare the HAR. The full path to your compare installation. In the format of https://compare.sitespeed.io/',
      group: 'HTML'
    })
    .option('html.pageSummaryMetrics', {
      describe:
        'Select from a list of metrics to be displayed for given URL(s).  Pass on multiple --html.pageSummaryMetrics to add more than one column. This is best used as an array in your config.json file.',
      group: 'HTML',
      default: htmlConfig.html.pageSummaryMetrics
    })
    .option('html.summaryBoxes', {
      describe:
        'Select required summary information to be displayed on result index page.',
      group: 'HTML',
      default: htmlConfig.html.summaryBoxes
    })
    .option('html.summaryBoxesThresholds', {
      describe:
        'Configure the thresholds for red/yellow/green for the summary boxes.',
      group: 'HTML'
    })
    .option('html.darkMode', {
      alias: ['darkMode'],
      describe: 'View test results with a dark theme.',
      default: false,
      type: 'boolean'
    })
    .option('html.homeurl', {
      default: 'https://www.sitespeed.io/',
      describe: 'The URL for the logo in the result',
      group: 'HTML'
    })
    .option('summary', {
      describe: 'Show brief text summary to stdout',
      default: false,
      type: 'boolean',
      group: 'Text'
    })
    .option('summary-detail', {
      describe: 'Show longer text summary to stdout',
      default: false,
      type: 'boolean',
      group: 'Text'
    })
    .option('sustainable.enable', {
      type: 'boolean',
      describe: 'Test if the web page is sustainable.',
      group: 'Sustainable'
    })
    .option('sustainable.model', {
      describe: 'Model used for measure digital carbon emissions.',
      default: '1byte',
      choices: ['1byte', 'swd'],
      group: 'Sustainable'
    })
    .option('sustainable.modelVersion', {
      describe:
        'The version used for the model. Only applicable for model swd at the moment.',
      default: 3,
      choices: [3, 4],
      group: 'Sustainable'
    })
    .option('sustainable.pageViews', {
      describe: 'Number of page views used when calculating CO2.',
      group: 'Sustainable'
    })
    .option('sustainable.disableHosting', {
      type: 'boolean',
      default: false,
      describe:
        'Disable the hosting check. Default we do a check to a local database of domains with green hosting provided by the Green Web Foundation',
      group: 'Sustainable'
    })
    .option('sustainable.useGreenWebHostingAPI', {
      type: 'boolean',
      default: false,
      describe:
        'Instead of using the local copy of the hosting database, you can use the latest version through the Green Web Foundation API. This means sitespeed.io will make HTTP GET to the the hosting info.',
      group: 'Sustainable'
    });

  parsed
    .option('api.key', {
      describe: 'The API key to use.',
      group: 'API'
    })
    .option('api.action', {
      describe:
        'The type of API call you want to do: You get add a test and wait for the result, just add a test or get the result. To get the result, make sure you add the id using --api.id',
      default: 'addAndGetResult',
      choices: ['add', 'addAndGetResult', 'get'],
      group: 'API'
    })
    .option('api.hostname', {
      describe: 'The hostname of the API server.',
      group: 'API'
    })
    .option('api.location', {
      describe: 'The location of the test runner that run the test.',
      group: 'API'
    })
    .option('api.silent', {
      describe:
        'Set to true if you do not want to log anything from the communication',
      default: false,
      type: 'boolean',
      group: 'API'
    })
    .option('api.port', {
      describe: 'The port for the API',
      port: 3000,
      group: 'API'
    })
    .option('api.id', {
      describe:
        'The id of the test. Use it when you want to get the test result.',
      type: 'string',
      group: 'API'
    })
    .option('api.label', {
      describe: 'Add a label to your test.',
      type: 'string',
      group: 'API'
    })
    .option('api.priority', {
      type: 'integer',
      describe: 'The priority of the test. Highest priority is 1.',
      group: 'API'
    })
    .option('api.json', {
      describe: 'Output the result as JSON.',
      group: 'API'
    });

  parsed
    .option('compare.id', {
      type: 'string',
      describe:
        'The id of the test. Will be used to find the baseline test, that is using the id as a part of the name. If you do not add an id, an id will be generated using the URL and that will only work if you baseline against the exact same URL.',
      group: 'compare'
    })
    .option('compare.baselinePath', {
      type: 'string',
      describe:
        'Specifies the path to the baseline data file. This file is used as a reference for comparison against the current test data.',
      group: 'compare'
    })
    .option('compare.saveBaseline', {
      type: 'boolean',
      default: false,
      describe:
        'Determines whether to save the current test data as the new baseline. Set to true to save the current data as baseline for future comparisons.',
      group: 'compare'
    })
    .option('compare.testType', {
      describe:
        'Selects the statistical test type to be used for comparison. Options are mannwhitneyu for the Mann-Whitney U test and wilcoxon for the Wilcoxon signed-rank test.',
      choices: ['mannwhitneyu', ' wilcoxon'],
      default: 'mannwhitneyu',
      group: 'compare'
    })
    .option('compare.alternative', {
      choices: ['less', ' greater', 'two-sided'],
      default: 'greater',
      describe:
        'Specifies the alternative hypothesis to be tested. Default is greater than means current data is greater than the baseline. two-sided means we look for different both ways and less means current is less than baseline. ',
      group: 'compare'
    })
    .option('compare.wilcoxon.correction', {
      type: 'boolean',
      describe:
        'Enables or disables the continuity correction in the Wilcoxon signed-rank test. Set to true to enable the correction.',
      default: false,
      group: 'compare'
    })
    .option('compare.wilcoxon.zeroMethod', {
      choices: ['wilcox', ' pratt', 'zsplit'],
      describe:
        'Specifies the method for handling zero differences in the Wilcoxon test. wilcox discards all zero-difference pairs, pratt includes all, and zsplit splits them evenly among positive and negative ranks.',
      default: 'zsplit',
      group: 'compare'
    })
    .option('compare.mannwhitneyu.useContinuity', {
      type: 'boolean',
      default: false,
      describe:
        'Determines whether to use continuity correction in the Mann-Whitney U test. Set to true to apply the correction.',
      group: 'compare'
    })
    .option('compare.mannwhitneyu.method', {
      choices: ['auto', ' exact', 'symptotic'],
      escribe:
        'Selects the method for calculating the Mann-Whitney U test. auto automatically selects between exact and asymptotic based on sample size, exact uses the exact distribution of U, and symptotic uses a normal approximation.',
      default: 'auto',
      group: 'compare'
    });
  parsed
    .option('mobile', {
      describe:
        'Access pages as mobile a fake mobile device. Set UA and width/height. For Chrome it will use device Moto G4.',
      default: false,
      type: 'boolean'
    })
    .option('resultBaseURL', {
      alias: 'resultBaseUrl',
      describe:
        'The base URL to the server serving the HTML result. In the format of https://result.sitespeed.io'
    })
    .option('gzipHAR', {
      describe: 'Compress the HAR files with GZIP.',
      default: false,
      type: 'boolean'
    })
    .option('outputFolder', {
      describe:
        'The folder where the result will be stored. If you do not set it, the result will be stored in "DOMAIN_OR_FILENAME_OR_SLUG/TIMESTAMP"',
      type: 'string'
    })
    .option('copyLatestFilesToBase', {
      default: false,
      describe:
        'Copy the latest screenshots to the root folder (so you can include it in Grafana). Do not work together it --outputFolder.',
      type: 'boolean'
    })
    .option('firstParty', {
      describe:
        'A regex running against each request and categorize it as first vs third party URL. (ex: ".*sitespeed.*"). If you do not set a regular expression parts of the domain from the tested URL will be used: ".*domain.*" '
    })
    .option('urlAlias', {
      describe:
        'Use an alias for the URL (if you feed URLs from a file you can instead have the alias in the file). You need to pass on the same amount of alias as URLs. The alias is used as the name of the URL on the HTML report and in Graphite/InfluxDB. Pass on multiple --urlAlias for multiple alias/URLs. This will override alias in a file.',
      type: 'string'
    })
    .option('groupAlias', {
      describe:
        'Use an alias for the group/domain. You need to pass on the same amount of alias as URLs. The alias is used as the name of the group in Graphite/InfluxDB. Pass on multiple --groupAlias for multiple alias/groups. This do not work for scripting at the moment.',
      type: 'string'
    })
    .option('utc', {
      describe: 'Use Coordinated Universal Time for timestamps',
      default: false,
      type: 'boolean'
    })
    .option('logToFile', {
      describe:
        'Store the log for your run into a file in logs/sitespeed.io.log',
      default: false,
      type: 'boolean'
    })
    .option('useHash', {
      describe:
        'If your site uses # for URLs and # give you unique URLs you need to turn on useHash. By default is it turned off, meaning URLs with hash and without hash are treated as the same URL',
      default: false,
      type: 'boolean'
    })
    .option('multi', {
      describe:
        'Test multiple URLs within the same browser session (same cache etc). Only works with Browsertime. Use this if you want to test multiple pages (use journey) or want to test multiple pages with scripts. You can mix URLs and scripts (the order will matter): login.js https://www.sitespeed.io/ logout.js - More details: https://www.sitespeed.io/documentation/sitespeed.io/scripting/',
      default: false,
      type: 'boolean'
    })
    .option('name', {
      describe: 'Give your test a name.'
    })
    .option('open', {
      alias: ['o', 'view'],
      describe:
        'Open your test result in your default browser (Mac OS or Linux with xdg-open).'
    })
    .option('slug', {
      describe:
        'Give your test a slug. The slug is used when you send the metrics to your data storage to identify the test and the folder of the tests. The max length of the slug is 200 characters and it can only contain a-z A-Z 0-9 and -_ characters.'
    })
    .option('disableAPI', {
      default: false,
      type: 'boolean'
    })
    .help('h')
    .alias('help', 'h')
    .config(config)
    .hide('disableAPI')
    .hide('browsertime.screenshotLCP')
    .hide('browsertime.screenshotLS')
    .alias('version', 'V')
    .version(version)
    .coerce('budget', function (argument) {
      if (argument) {
        if (typeof argument === 'object' && !Array.isArray(argument)) {
          if (argument.configPath) {
            argument.config = JSON.parse(
              readFileSync(argument.configPath, 'utf8')
            );
          } else if (argument.config) {
            argument.config = JSON.parse(argument.config);
          }
          return argument;
        } else {
          throw new TypeError(
            '[ERROR] Something looks wrong with your budget configuration. Since sitespeed.io 4.4 you should pass the path to your budget file through the --budget.configPath flag instead of directly through the --budget flag.'
          );
        }
      }
    })
    .coerce('crawler', crawler => {
      if (crawler) {
        if (crawler.exclude) {
          if (!Array.isArray(crawler.exclude)) {
            crawler.exclude = [crawler.exclude];
          }
          crawler.exclude = crawler.exclude.map(e => new RegExp(e));
        }

        if (crawler.include) {
          if (!Array.isArray(crawler.include)) {
            crawler.include = [crawler.include];
          }
          crawler.include = crawler.include.map(e => new RegExp(e));
        }

        return crawler;
      }
    })
    .coerce('plugins', plugins => {
      if (plugins) {
        if (plugins.add && !Array.isArray(plugins.add)) {
          plugins.add = plugins.add.split(',');
        }
        if (plugins.remove && !Array.isArray(plugins.remove)) {
          plugins.remove = plugins.remove.split(',');
        }
        return plugins;
      }
    })
    //     .describe('browser', 'Specify browser')
    .wrap(yargsInstance.terminalWidth())
    //  .check(validateInput)
    .epilog(
      'Read the docs at https://www.sitespeed.io/documentation/sitespeed.io/'
    )
    .check(validateInput);

  const aliases = parsed.getOptions().alias,
    argv = parsed.argv;

  // hack to keep backward compability to --android
  if (
    argv.android === true ||
    (argv.browsertime && argv.browsertime.android === true)
  ) {
    set(argv, 'browsertime.android.enabled', true);
  }
  // aliases are long options -> short option
  const aliasLookup = reduce(
    aliases,
    (lookup, value, key) => {
      lookup.set(value[0], key);
      return lookup;
    },
    new Map()
  );

  let explicitOptions = yargs(hideBin(process.argv)).argv;

  explicitOptions = merge(
    explicitOptions,
    yargsInstance.getOptions().configObjects[0]
  );

  explicitOptions = reduce(
    explicitOptions,
    (result, value, key) => {
      if (aliasLookup.has(key)) {
        const fullKey = aliasLookup.get(key);
        result = set(result, fullKey, value);
      }
      result = set(result, key, value);
      return result;
    },
    {}
  );

  if (argv.config) {
    const config = JSON.parse(
      await readFileSync(path.resolve(process.cwd(), argv.config))
    );
    explicitOptions = merge(explicitOptions, config);
  }

  if (argv.summaryDetail) argv.summary = true;

  if (
    argv.firefox &&
    (argv.firefox.nightly || argv.firefox.beta || argv.firefox.developer)
  ) {
    argv.browsertime.browser = 'firefox';
    if (argv.android) {
      // TODO add support for Firefox dev
      set(
        argv,
        'browsertime.firefox.android.package',
        argv.firefox.nightly ? 'org.mozilla.fenix' : 'org.mozilla.firefox_beta'
      );

      set(
        argv,
        'browsertime.firefox.android.activity',
        'org.mozilla.fenix.IntentReceiverActivity'
      );
    }
  } else if (argv.safari && argv.safari.ios) {
    argv.browsertime.browser = 'safari';
  }

  if (argv.ios) {
    set(argv, 'safari.ios', true);
  } else if (argv.android && argv.browser === 'chrome') {
    // Default to Chrome Android.
    set(
      argv,
      'browsertime.chrome.android.package',
      get(argv, 'browsertime.chrome.android.package', 'com.android.chrome')
    );
  }

  // Always use hash by default when you configure spa
  if (argv.spa) {
    set(argv, 'useHash', true);
    set(argv, 'browsertime.useHash', true);
  }

  if (
    argv.cpu &&
    (argv.browsertime.browser === 'chrome' ||
      argv.browsertime.browser === 'edge')
  ) {
    set(argv, 'browsertime.chrome.collectLongTasks', true);
    set(argv, 'browsertime.chrome.timeline', true);
  }
  // Enable when we know how much overhead it will add
  /*
      else if (argv.browsertime.browser === 'firefox') {
      set(argv, 'browsertime.firefox.geckoProfiler', true);
    }*/

  // we missed to populate this to Browsertime in the cli
  // so to stay backward compatible we do it manually
  if (argv.useHash) {
    set(argv, 'browsertime.useHash', true);
  }

  if (argv.browsertime.docker) {
    set(argv, 'browsertime.video', get(argv, 'browsertime.video', true));
    set(
      argv,
      'browsertime.visualMetrics',
      get(argv, 'browsertime.visualMetrics', true)
    );
  }

  if (argv.browsertime.safari && argv.browsertime.safari.useSimulator) {
    set(argv, 'browsertime.connectivity.engine', 'throttle');
  } else if (
    (platform() === 'darwin' || platform() === 'linux') &&
    !argv.browsertime.android.enabled &&
    !argv.browsertime.safari.ios &&
    !argv.browsertime.docker &&
    get(explicitOptions, 'browsertime.connectivity.engine', '') === '' &&
    get(explicitOptions, 'connectivity.engine', '') === ''
  ) {
    set(argv, 'browsertime.connectivity.engine', 'throttle');
  }

  if (
    argv.gcs &&
    argv.gcs.bucketname &&
    !argv.resultBaseUrl &&
    !argv.resultBaseURL
  ) {
    set(
      argv,
      'resultBaseURL',
      'https://storage.googleapis.com/' + argv.gcs.bucketname
    );
  }

  let urlsMetaData = getAliases(argv._, argv.urlAlias, argv.groupAlias);
  // Copy the alias so it is also used by Browsertime
  if (argv.urlAlias) {
    // Browsertime has it own way of handling alias
    // We could probably hack this better next year
    let urls = argv._;
    let meta = {};

    if (!Array.isArray(argv.urlAlias)) argv.urlAlias = [argv.urlAlias];

    for (const [index, url] of urls.entries()) {
      meta[url] = argv.urlAlias[index];
    }
    set(argv, 'browsertime.urlMetaData', meta);
  } else if (Object.keys(urlsMetaData).length > 0) {
    let meta = {};
    for (let key of Object.keys(urlsMetaData)) {
      meta[key] = urlsMetaData[key].urlAlias;
    }
    set(argv, 'browsertime.urlMetaData', meta);
  }

  // Set the timeouts to a maximum while debugging
  if (argv.debug) {
    set(argv, 'browsertime.timeouts.pageload', 2_147_483_647);
    set(argv, 'browsertime.timeouts.script', 2_147_483_647);
    set(argv, 'browsertime.timeouts.pageCompleteCheck', 2_147_483_647);
  }

  return {
    urls: argv.multi ? argv._ : getURLs(argv._),
    urlsMetaData,
    options: argv,
    explicitOptions: explicitOptions
  };
}
