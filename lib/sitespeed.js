'use strict';

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const log = require('intel').getLogger('sitespeedio');
const intel = require('intel');
const os = require('os');
const process = require('process');
const logging = require('./core/logging');
const toArray = require('./support/util').toArray;
const pullAll = require('lodash.pullall');
const union = require('lodash.union');
const messageMaker = require('./support/messageMaker');
const filterRegistry = require('./support/filterRegistry');
const statsHelpers = require('./support/statsHelpers');
const packageInfo = require('../package');

const QueueHandler = require('./core/queueHandler');
const resultsStorage = require('./core/resultsStorage');
const loader = require('./core/pluginLoader');
const urlSource = require('./core/url-source');
const scriptSource = require('./core/script-source');

dayjs.extend(utc);

const budgetResult = {
  working: {},
  failing: {}
};

function hasFunctionFilter(functionName) {
  return obj => typeof obj[functionName] === 'function';
}

function runOptionalFunction(objects, fN) {
  // NOTE: note slicing due to https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
  let args = new Array(arguments.length - 2);
  for (let i = 2; i < arguments.length; i++) {
    args[i - 2] = arguments[i];
  }
  return objects
    .filter(hasFunctionFilter(fN))
    .map(plugin => Promise.resolve(plugin[fN].apply(plugin, args)));
}

module.exports = {
  async run(options) {
    const url = options.urls[0];
    const timestamp = options.utc ? dayjs.utc() : dayjs();
    const { storageManager, resultUrls } = resultsStorage(
      url,
      timestamp,
      options.outputFolder,
      options.resultBaseURL,
      options.useHash
    );

    // Setup logging
    const logDir = await storageManager.createDirectory('logs');
    logging.configure(options, logDir);

    // Tell the world what we are using
    log.info(
      'Versions OS: %s nodejs: %s sitespeed.io: %s browsertime: %s coach: %s',
      os.platform() + ' ' + os.release(),
      process.version,
      packageInfo.version,
      packageInfo.dependencies.browsertime,
      packageInfo.dependencies.webcoach
    );
    log.verbose('Config options: %:2j', options);

    let pluginNames = await loader.parsePluginNames(options);

    const plugins = options.plugins;

    // Deprecated setup
    if (plugins) {
      if (plugins.disable) {
        log.warn(
          '--plugins.disable is deprecated, use plugins.remove instead.'
        );
        plugins.remove = plugins.disable;
      }
      if (plugins.load) {
        log.warn('--plugins.load is deprecated, use plugins.add instead.');
        plugins.add = plugins.load;
      }

      // Finalize the plugins that we wanna run
      pullAll(pluginNames, toArray(plugins.remove));
      pluginNames = union(pluginNames, toArray(plugins.add));

      if (plugins.list) {
        log.info(
          'The following plugins are enabled: %s',
          pluginNames.join(', ')
        );
      }
    }

    const runningPlugins = await loader.loadPlugins(pluginNames);
    const urlSources = [options.multi ? scriptSource : urlSource];
    const allPlugins = urlSources.concat(runningPlugins);
    const queueHandler = new QueueHandler(runningPlugins, options);

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

    // Open/start each and every plugin
    try {
      await runOptionalFunction(allPlugins, 'open', context, options);

      // Pass the URLs
      const errors = await queueHandler.run(urlSources);

      // Close the plugins
      await runOptionalFunction(allPlugins, 'close', options, errors);

      if (resultUrls.hasBaseUrl()) {
        log.info('Find the result at %s', resultUrls.reportSummaryUrl());
      }

      if (options.summary && options.summary.out) {
        console.log(options.summary.out); // eslint-disable-line no-console
      }
      return {
        errors,
        budgetResult
      };
    } catch (err) {
      log.error(err);
      throw err;
    }
  }
};
