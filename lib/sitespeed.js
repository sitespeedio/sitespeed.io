'use strict';

const Promise = require('bluebird'),
  moment = require('moment'),
  log = require('intel').getLogger('sitespeedio'),
  os = require('os'),
  process = require('process'),
  logging = require('./support/logging'),
  toArray = require('./support/util').toArray,
  difference = require('lodash.difference'),
  merge = require('lodash.merge'),
  pullAll = require('lodash.pullall'),
  union = require('lodash.union'),
  DataCollection = require('./support/dataCollection'),
  browsertimeConfig = require('./plugins/browsertime').config,
  webpagetestConfig = require('./plugins/webpagetest').config,
  packageInfo = require('../package');

const QueueHandler = require('./support/queueHandler'),
  resultsStorage = require('./support/resultsStorage'),
  loader = require('./support/pluginLoader'),
  urlSource = require('./support/url-source');

const budgetResult = {
  working: {},
  failing: {}
};

function hasFunctionFilter(functionName) {
  return obj => typeof obj[functionName] === 'function';
}

function allInArray(sampleArray, referenceArray) {
  return difference(sampleArray, referenceArray).length === 0;
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

    const dataCollection = new DataCollection();

    return storageManager
      .createDataDir('logs')
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
      })
      .then(() => {
        return loader.parsePluginNames(options);
      })
      .then(pluginNames => {
        const plugins = options.plugins;
        if (plugins) {
          pullAll(pluginNames, toArray(plugins.disable));
          pluginNames = union(pluginNames, toArray(plugins.load));

          if (plugins.list) {
            log.info(
              'The following plugins are enabled: %s',
              pluginNames.join(', ')
            );
          }
        }
        // if we run without cli, we still want the default options
        // in options to use it in output
        if (allInArray(['browsertime'], pluginNames)) {
          options.browsertime = merge(
            {},
            browsertimeConfig,
            options.browsertime
          );
        }
        if (allInArray(['webpagetest'], pluginNames)) {
          options.webpagetest = merge(
            {},
            webpagetestConfig,
            options.webpagetest
          );
        }
        if (allInArray(['browsertime', 'coach'], pluginNames)) {
          options.browsertime = merge({}, options.browsertime, {
            coach: true
          });
        }
        if (allInArray(['browsertime', 'screenshot'], pluginNames)) {
          options.browsertime = merge({}, options.browsertime, {
            screenshot: true
          });
        }
        return pluginNames;
      })
      .then(pluginNames => {
        return loader.loadPlugins(pluginNames).then(plugins => {
          let urlSources = [urlSource];

          const allPlugins = urlSources.concat(plugins),
            queueHandler = new QueueHandler(plugins, options);

          return runOptionalFunction(
            allPlugins,
            'open',
            {
              storageManager,
              resultUrls,
              dataCollection,
              timestamp,
              budget: budgetResult,
              name: url,
              log
            },
            options
          )
            .then(() => runOptionalFunction(allPlugins, 'postOpen', options))
            .then(() => queueHandler.run(urlSources))
            .tap(errors =>
              runOptionalFunction(allPlugins, 'close', options, errors)
            )
            .tap(errors =>
              runOptionalFunction(allPlugins, 'postClose', options, errors)
            )
            .tap(errors =>
              runOptionalFunction(allPlugins, 'final', options, errors)
            );
        });
      })
      .then(errors => {
        log.info('Finished analysing %s', url);
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
