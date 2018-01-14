'use strict';

const Promise = require('bluebird'),
  path = require('path'),
  fs = require('fs');

Promise.promisifyAll(fs);

const defaultPlugins = new Set([
  'browsertime',
  'coach',
  'pagexray',
  'domains',
  'assets',
  'html',
  'screenshot',
  'metrics',
  'text',
  'harstorer',
  'budget',
  'tracestorer'
]);

const pluginsDir = path.join(__dirname, '..', 'plugins');

module.exports = {
  parsePluginNames(options) {
    // if we don't use the cli, this will work out fine as long
    // we configure only what we need
    const possibleConfiguredPlugins = options.explicitOptions || options;
    const isDefaultOrConfigured = name =>
      defaultPlugins.has(name) ||
      typeof possibleConfiguredPlugins[name] === 'object';
    const addMessageLoggerIfDebug = pluginNames => {
      if (options.debug) {
        // Need to make sure logger is first, so message logs appear
        // before messages are handled by other plugins
        pluginNames = ['messagelogger'].concat(pluginNames);
      }
      return pluginNames;
    };

    return fs
      .readdirAsync(pluginsDir)
      .map(name => path.basename(name, '.js'))
      .then(builtins => {
        let plugins = builtins.filter(isDefaultOrConfigured);
        return addMessageLoggerIfDebug(plugins);
      });
  },
  loadPlugins(pluginNames) {
    return Promise.resolve(pluginNames).map(name => {
      try {
        const plugin = require(path.join(pluginsDir, name));
        if (!plugin.name) {
          plugin.name = () => name;
        }
        return plugin;
      } catch (err) {
        try {
          return require(path.resolve(process.cwd(), name));
        } catch (error) {
          console.error("Couldn't load plugin %s: %s", name, err); // eslint-disable-line no-console
          // if it fails here, let it fail hard
          throw error;
        }
      }
    });
  }
};
