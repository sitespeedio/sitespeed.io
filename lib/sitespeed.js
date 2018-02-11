'use strict';

const Promise = require('bluebird'),
  moment = require('moment'),
  log = require('intel').getLogger('sitespeedio'),
  intel = require('intel'),
  os = require('os'),
  process = require('process'),
  logging = require('./core/logging'),
  toArray = require('./support/util').toArray,
  pullAll = require('lodash.pullall'),
  union = require('lodash.union'),
  messageMaker = require('./support/messageMaker'),
  filterRegistry = require('./support/filterRegistry'),
  statsHelpers = require('./support/statsHelpers'),
  packageInfo = require('../package');

const QueueHandler = require('./core/queueHandler'),
  resultsStorage = require('./core/resultsStorage'),
  loader = require('./core/pluginLoader'),
  urlSource = require('./core/url-source');

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
  return Promise.resolve(objects)
    .filter(hasFunctionFilter(fN))
    .map(plugin => Promise.resolve(plugin[fN].apply(plugin, args)));
}

module.exports = {
  run(options) {
    const url = options.urls[0];
    const timestamp = moment();

    if (options.utc) {
      timestamp.utc();
    }

    const { storageManager, resultUrls } = resultsStorage(
      url,
      timestamp,
      options.outputFolder,
      options.resultBaseURL
    );

    return storageManager
      .createDirectory('logs')
      .then(logDir => {
        logging.configure(options, logDir);
      })
      .then(() => {
        if (log.isEnabledFor(log.VERBOSE)) {
          Promise.longStackTraces();
        }
        log.info(
          'Versions OS: %s nodejs: %s sitespeed.io: %s browsertime: %s coach: %s',
          os.platform() + ' ' + os.release(),
          process.version,
          packageInfo.version,
          packageInfo.dependencies.browsertime,
          packageInfo.dependencies.webcoach
        );
        log.verbose('Config options %s', JSON.stringify(options));
      })
      .then(() => {
        return loader.parsePluginNames(options);
      })
      .then(pluginNames => {
        const plugins = options.plugins;
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

          pullAll(pluginNames, toArray(plugins.remove));
          pluginNames = union(pluginNames, toArray(plugins.add));

          if (plugins.list) {
            log.info(
              'The following plugins are enabled: %s',
              pluginNames.join(', ')
            );
          }
        }
        return pluginNames;
      })
      .then(pluginNames => {
        return loader.loadPlugins(pluginNames).then(plugins => {
          let urlSources = [urlSource];
          const allPlugins = urlSources.concat(plugins),
            queueHandler = new QueueHandler(plugins, options);

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
          return runOptionalFunction(allPlugins, 'open', context, options)
            .then(() => queueHandler.run(urlSources))
            .tap(errors =>
              runOptionalFunction(allPlugins, 'close', options, errors)
            );
        });
      })
      .then(errors => {
        log.info('Finished analysing %s', url);
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
      })
      .catch(err => {
        log.error(err);
        throw err;
      });
  }
};
