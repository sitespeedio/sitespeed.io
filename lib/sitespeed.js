'use strict';

const Promise = require('bluebird'),
  moment = require('moment'),
  log = require('intel'),
  os = require('os'),
  logging = require('../lib/support/logging'),
  difference = require('lodash.difference'),
  merge = require('lodash.merge'),
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

    const timestamp = moment();

    if (options.utc) {
      timestamp.utc();
    }

    const storageManager = new StorageManager(options, timestamp);

    return storageManager.createDataDir('logs').then((logDir) => {
        logging.configure(options, logDir);
      }).then(() => {
        if (log.isEnabledFor(log.VERBOSE)) {
          Promise.longStackTraces();
        }
        log.info('Versions OS: %s sitespeed.io: %s browsertime: %s coach: %s', os.platform() + ' ' + os.release(), packageInfo.version, packageInfo.dependencies.browsertime, packageInfo.dependencies.webcoach);
      }).then(() => {
        if (allInArray(['browsertime', 'coach'], pluginNames)) {
          options.browsertime = merge({}, options.browsertime, {
            coach: true
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
              .then(() => queueHandler.run(urlSources))
              .tap((errors) => runOptionalFunction(allPlugins, 'close', options, errors));
          })
      })
      .then((errors) => {
        log.info('Finished analysing %s', options._);
        return errors;
      })
  }
}
