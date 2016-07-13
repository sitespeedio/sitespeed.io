'use strict';

const Promise = require('bluebird'),
  path = require('path'),
  fs = require('fs');

Promise.promisifyAll(fs);

const defaultPlugins = new Set(['browsertime', 'coach', 'domains', 'assets', 'html', 'analysisStorer','screenshot','metrics']);

const pluginsDir = path.join(__dirname, '..', 'plugins');

module.exports = {
  parsePluginNames(rawConfig) {
    const isDefaultOrConfigured = (name) => (defaultPlugins.has(name) || typeof rawConfig[name] === 'object');
    const addMessageLoggerIfDebug = (pluginNames) => {
      if (rawConfig.debug) {
        // Need to make sure logger is first, so message logs appear
        // before messages are handled by other plugins
        pluginNames = ['messageLogger'].concat(pluginNames);
      }
      return pluginNames;
    };

    return fs.readdirAsync(pluginsDir)
      .map((name) => path.basename(name, '.js'))
      .then((builtins) => {
        let plugins = builtins.filter(isDefaultOrConfigured);

        return addMessageLoggerIfDebug(plugins);
      });
  },
  loadPlugins(pluginNames) {
    return Promise.resolve(pluginNames).map((name) => require(path.join(pluginsDir, name)));

  }
};
