export function addOptions(yargs) {
  yargs
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
    });
}
