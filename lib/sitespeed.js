import { platform, release } from 'node:os';
import { env, version } from 'node:process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import intel from 'intel';
import pullAll from 'lodash.pullall';
import union from 'lodash.union';

import { configure } from './core/logging.js';
import { toArray } from './support/util.js';
import { messageMaker } from './support/messageMaker.js';
import * as filterRegistry from './support/filterRegistry.js';
import * as statsHelpers from './support/statsHelpers.js';
import { QueueHandler } from './core/queueHandler.js';
import { resultsStorage } from './core/resultsStorage/index.js';
import { parsePluginNames, loadPlugins } from './core/pluginLoader.js';
import * as urlSource from './core/url-source.js';
import * as scriptSource from './core/script-source.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const packageJson = JSON.parse(
  await fs.readFile(resolve(join(__dirname, '..', 'package.json')))
);

const log = intel.getLogger('sitespeedio');
dayjs.extend(utc);

const budgetResult = {
  working: {},
  failing: {},
  error: {}
};

function hasFunctionFilter(functionName) {
  return object => typeof object[functionName] === 'function';
}

function runOptionalFunction(objects, fN) {
  // NOTE: note slicing due to https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments

  let arguments_ = Array.from({ length: arguments.length - 2 });
  for (let index = 2; index < arguments.length; index++) {
    arguments_[index - 2] = arguments[index];
  }

  return objects
    .filter(hasFunctionFilter(fN))
    .map(plugin => Promise.resolve(plugin[fN].apply(plugin, arguments_)));
}

export async function run(options) {
  const url = options.urls[0];
  const timestamp = options.utc ? dayjs.utc() : dayjs();
  const { storageManager, resultUrls } = resultsStorage(
    url,
    timestamp,
    options
  );

  // Setup logging
  const logDir = await storageManager.createDirectory('logs');

  if (
    options.browsertime &&
    options.browsertime.tcpdump &&
    !env.SSLKEYLOGFILE
  ) {
    env.SSLKEYLOGFILE = join(storageManager.getBaseDir(), 'SSLKEYLOGFILE.txt');
  }
  configure(options, logDir);

  // Tell the world what we are using
  log.info(
    'Versions OS: %s nodejs: %s sitespeed.io: %s browsertime: %s coach: %s',
    platform() + ' ' + release(),
    version,
    packageJson.version,
    packageJson.dependencies.browsertime,
    packageJson.dependencies['coach-core']
  );
  if (log.isEnabledFor(log.DEBUG)) {
    log.debug('Running with options: %:2j', options);
  }

  let pluginNames = await parsePluginNames(options);

  const plugins = options.plugins;

  // Deprecated setup
  if (plugins) {
    if (plugins.disable) {
      log.warn('--plugins.disable is deprecated, use plugins.remove instead.');
      plugins.remove = plugins.disable;
    }
    if (plugins.load) {
      log.warn('--plugins.load is deprecated, use plugins.add instead.');
      plugins.add = plugins.load;
    }

    // Finalize the plugins that we wanna run
    // First we add the new ones and then remove, that means remove
    // always wins
    pluginNames = union(pluginNames, toArray(plugins.add));
    pullAll(pluginNames, toArray(plugins.remove));
    if (plugins.list) {
      log.info('The following plugins are enabled: %s', pluginNames.join(', '));
    }
  }

  // This is the contect where we wanna run our tests
  const context = {
    storageManager,
    resultUrls,
    timestamp,
    budget: budgetResult,
    name: url,
    log,
    intel,
    messageMaker,
    statsHelpers,
    filterRegistry
  };

  const queueHandler = new QueueHandler(options);
  const runningPlugins = await loadPlugins(
    pluginNames,
    options,
    context,
    queueHandler
  );
  const urlSources = [options.multi ? scriptSource : urlSource];
  const allPlugins = [...runningPlugins];
  queueHandler.setup(runningPlugins);

  // Open/start each and every plugin
  try {
    await Promise.all(
      runOptionalFunction(allPlugins, 'open', context, options)
    );

    // Pass the URLs
    const errors = await queueHandler.run(urlSources);

    // Close the plugins
    await Promise.all(
      runOptionalFunction(allPlugins, 'close', options, errors)
    );

    if (resultUrls.hasBaseUrl()) {
      log.info(
        'Find the result at %s',
        resultUrls.reportSummaryUrl() + '/index.html'
      );
    }

    if (options.summary && options.summary.out) {
      console.log(options.summary.out); // eslint-disable-line no-console
    }

    let pageSummaryUrl = '';
    if (resultUrls.hasBaseUrl() && options.multi) {
      pageSummaryUrl = resultUrls.reportSummaryUrl() + '/index.html';
    } else if (resultUrls.hasBaseUrl() && url) {
      pageSummaryUrl = resultUrls.absoluteSummaryPageUrl(url) + 'index.html';
    }

    return {
      errors,
      budgetResult,
      resultUrl: resultUrls.hasBaseUrl()
        ? resultUrls.reportSummaryUrl() + '/index.html'
        : '',
      pageSummaryUrl,
      localPath: storageManager.getBaseDir()
    };
  } catch (error) {
    log.error(error);
    throw error;
  }
}
