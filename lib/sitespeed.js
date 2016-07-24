'use strict';

const Promise = require('bluebird'),
  moment = require('moment'),
  log = require('intel'),
  os = require('os'),
  process = require('process'),
  logging = require('../lib/support/logging'),
  difference = require('lodash.difference'),
  merge = require('lodash.merge'),
  pullAll = require('lodash.pullall'),
  packageInfo = require('../package');

const QueueHandler = require('./support/queueHandler'),
  StorageManager = require('./support/storageManager'),
  loader = require('./support/pluginLoader'),
  urlSource = require('./support/url-source');

function hasFunctionFilter(functionName) {
  return ((obj) => (typeof obj[functionName] === 'function'));
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
    .map((plugin) => Promise.resolve(plugin[fN].apply(plugin, args)));
}

module.exports = {
  run(pluginNames, options) {

    // remove disabled plugins
    let disabledPlugins = options.plugins ? options.plugins.disable : [];
    pullAll(pluginNames,disabledPlugins);

    const url = options._[0];
    const timestamp = moment();

    if (options.utc) {
      timestamp.utc();
    }

    const storageManager = new StorageManager(url, timestamp, options);

    return storageManager.createDataDir('logs').then((logDir) => {
        logging.configure(options, logDir);
      }).then(() => {
        if (log.isEnabledFor(log.VERBOSE)) {
          Promise.longStackTraces();
        }
        log.info('Versions OS: %s nodejs: %s sitespeed.io: %s browsertime: %s coach: %s', os.platform() + ' ' + os.release(), process.version, packageInfo.version, packageInfo.dependencies.browsertime, packageInfo.dependencies.webcoach);

        if (options.plugins && options.plugins.list) {
          log.info('The following plugins is enabled: %s', pluginNames);
        }

      }).then(() => {
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
      .then(() => {

        return loader.loadPlugins(pluginNames)
          .then((plugins) => {

            let urlSources = [urlSource];

            const allPlugins = urlSources.concat(plugins),
              queueHandler = new QueueHandler(plugins, options);

            return runOptionalFunction(allPlugins, 'open', {
                storageManager,
                timestamp
              }, options)
              .then(() => runOptionalFunction(allPlugins, 'postOpen', options))
              .then(() => queueHandler.run(urlSources))
              .tap((errors) => runOptionalFunction(allPlugins, 'close', options, errors));
          })
      })
      .then((errors) => {
        log.info('Finished analysing %s', options._);
        return errors;
      })
      .catch((err) => {
        log.error('Error %s', err);
        throw err;
      })
  }
}
