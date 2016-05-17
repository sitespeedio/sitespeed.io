'use strict';

const Promise = require('bluebird'),
  moment = require('moment');

const QueueHandler = require('./support/queueHandler'),
  StorageManager = require('./support/storageManager'),
  urlSource = require('./support/url-source');

function hasFunctionFilter(functionName) {
  return ((obj) => (typeof obj[functionName] === 'function'));
}

class App {
  constructor(plugins, options) {
    this.plugins = plugins;
    this.options = options;
  }

  run() {
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

    let urlSources = [urlSource];

    const plugins = urlSources.concat(this.plugins);

    const timestamp = moment(), storageManager = new StorageManager(this.options, timestamp),
      queueHandler = new QueueHandler(this.plugins, this.options);

    return runOptionalFunction(plugins, 'open', {storageManager, timestamp}, this.options)
      .then(() => queueHandler.run(urlSources))
      .tap((errors) => runOptionalFunction(plugins, 'close', this.options, errors));
  }
}

module.exports = App;
