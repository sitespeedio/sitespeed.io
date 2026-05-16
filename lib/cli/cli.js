import path from 'node:path';
import { platform } from 'node:os';
import { readFileSync } from 'node:fs';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { get, set, merge } from '../support/objectPath.js';

import { config, globalPluginsToAdd, version } from './configLoader.js';
import { validateInput } from './validate.js';
import { addOptions as addCoreOptions } from './options/core.js';
import { addOptions as addBrowserOptions } from './options/browser.js';
import { addOptions as addVideoOptions } from './options/video.js';
import { addOptions as addFirefoxOptions } from './options/firefox.js';
import { addOptions as addChromeOptions } from './options/chrome.js';
import { addOptions as addEdgeOptions } from './options/edge.js';
import { addOptions as addSafariOptions } from './options/safari.js';
import { addOptions as addAndroidOptions } from './options/android.js';
import { addOptions as addScreenshotOptions } from './options/screenshot.js';
import { addOptions as addGraphiteOptions } from './options/graphite.js';
import { addOptions as addGrafanaOptions } from './options/grafana.js';
import { addOptions as addHtmlOptions } from './options/html.js';
import { addOptions as addSlackOptions } from './options/slack.js';
import { addOptions as addS3Options } from './options/s3.js';
import { addOptions as addGcsOptions } from './options/gcs.js';
import { addOptions as addScpOptions } from './options/scp.js';
import { addOptions as addMatrixOptions } from './options/matrix.js';
import { addOptions as addBudgetOptions } from './options/budget.js';
import { addOptions as addCruxOptions } from './options/crux.js';
import { addOptions as addSustainableOptions } from './options/sustainable.js';
import { addOptions as addCrawlerOptions } from './options/crawler.js';
import { addOptions as addMetricsOptions } from './options/metrics.js';
import { addOptions as addCompareOptions } from './options/compare.js';
import { addOptions as addApiOptions } from './options/api.js';
import { addOptions as addPluginsOptions } from './options/plugins.js';
import { addOptions as addTextOptions } from './options/text.js';
import { registerPluginOptions } from './pluginOptions.js';
import { getURLs, getAliases, hasScriptInput } from './util.js';
import {
  classifyHelp,
  registerTopics,
  applyHelpFilter,
  buildEpilog
} from './helpTopics.js';

function fixAndroidArgs(args) {
  return args.map(arg => (arg === '--android' ? '--android.enabled' : arg));
}

// Topic groups for --help <topic>. Order here also drives the order the
// option groups are registered; it matches the historical ordering so
// the default --help output for power users stays stable.
const TOPIC_DEFS = [
  ['core', addCoreOptions],
  ['browser', addBrowserOptions],
  ['video', addVideoOptions],
  ['firefox', addFirefoxOptions],
  ['chrome', addChromeOptions],
  ['edge', addEdgeOptions],
  ['safari', addSafariOptions],
  ['android', addAndroidOptions],
  ['screenshot', addScreenshotOptions],
  ['graphite', addGraphiteOptions],
  ['grafana', addGrafanaOptions],
  ['html', addHtmlOptions],
  ['slack', addSlackOptions],
  ['s3', addS3Options],
  ['gcs', addGcsOptions],
  ['scp', addScpOptions],
  ['matrix', addMatrixOptions],
  ['budget', addBudgetOptions],
  ['crux', addCruxOptions],
  ['sustainable', addSustainableOptions],
  ['crawler', addCrawlerOptions],
  ['metrics', addMetricsOptions],
  ['compare', addCompareOptions],
  ['api', addApiOptions],
  ['plugins', addPluginsOptions],
  ['text', addTextOptions]
];

export async function parseCommandLine() {
  const rawArgs = hideBin(process.argv);
  // Detect --help <topic> / --help-all up front and rewrite them to a
  // bare --help so yargs still triggers its normal help+exit flow.
  const help = classifyHelp(rawArgs);
  const fixedArgs = fixAndroidArgs(help.args);
  const yargsInstance = yargs(fixedArgs);
  yargsInstance
    .parserConfiguration({
      'camel-case-expansion': false,
      'deep-merge-config': true
    })
    .env('SITESPEED_IO')
    .usage('$0 [options] <url>/<file>');

  const topicKeys = registerTopics(yargsInstance, TOPIC_DEFS);

  yargsInstance
    .help('h')
    .alias('help', 'h')
    .config(config)
    .hide('disableAPI')
    .hide('browsertime.screenshotLCP')
    .hide('browsertime.screenshotLS')
    .alias('version', 'V')
    .version(version);

  await registerPluginOptions(yargsInstance, globalPluginsToAdd);

  applyHelpFilter(yargsInstance, help.mode, help.topic, topicKeys);

  let parsed = yargsInstance
    .wrap(yargsInstance.terminalWidth())
    //  .check(validateInput)
    .epilog(buildEpilog(help.mode, help.topic, [...topicKeys.keys()]))
    .check(validateInput);

  const aliases = parsed.getOptions().alias,
    argv = parsed.argv;

  // aliases are long options -> short option
  const aliasLookup = new Map();
  for (const [key, value] of Object.entries(aliases)) {
    aliasLookup.set(value[0], key);
  }

  let explicitOptions = yargs(hideBin(process.argv)).argv;

  explicitOptions = merge(
    explicitOptions,
    yargsInstance.getOptions().configObjects[0]
  );

  explicitOptions = Object.entries(explicitOptions).reduce(
    (result, [key, value]) => {
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
  } else if (argv.android.enabled === true && argv.browser === 'chrome') {
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

  // Pass on webpagereplay setup to browsertime
  if (argv.webpagereplay) {
    set(argv, 'browsertime.webpagereplay', true);
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

  // Auto-detect: if any positional argument is a Browsertime script, flip
  // multi mode on so users no longer need to pass --multi. The flag still
  // works for explicit opt-in (e.g. running a list of URLs in one shared
  // browser session, which has no script to detect).
  if (!argv.multi && hasScriptInput(argv._)) {
    argv.multi = true;
  }

  let urlsMetaData = argv.multi
    ? {}
    : getAliases(argv._, argv.urlAlias, argv.groupAlias);
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
