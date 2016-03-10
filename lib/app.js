'use strict';

const Promise = require('bluebird');

const QueueHandler = require('./core/queueHandler'),
  StorageManager = require('./support/storageManager'),
  urlSource = require('./sources/url-source');

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

    const storageManager = new StorageManager(this.options),
      queueHandler = new QueueHandler(this.plugins, this.options);

    return runOptionalFunction(plugins, 'open', {storageManager}, this.options)
      .then(() => queueHandler.run(urlSources))
      .tap(() => runOptionalFunction(plugins, 'close', this.options));
  }
}

module.exports = App;
