import { config as browsertimeConfig } from '../../plugins/browsertime/index.js';

export function addOptions(yargs) {
  yargs
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
        'Add custom Javascript that collect metrics and run after the page has finished loading. Note that --script can be passed multiple times if you want to collect multiple metrics. The metrics will automatically be pushed to the summary/detailed summary and each individual page + sent to Graphite',
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
    .option('browsertime.scriptInput.longTask', {
      alias: 'minLongTaskLength',
      description:
        'Set the minimum length of a task to be categorised as a CPU Long Task. It can never be smaller than 50. The value is in ms and you make Browsertime collect long tasks using --chrome.collectLongTasks or --cpu.',
      type: 'number',
      default: 50,
      group: 'Browser'
    })
    .option('browsertime.userTimingAllowList', {
      alias: 'userTimingAllowList',
      describe:
        'This option takes a regex that will whitelist which userTimings to capture in the results. All userTimings are captured by default.',
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
    });
}
