'use strict';

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);

const defaultPlugins = new Set([
  'browsertime',
  'coach',
  'pagexray',
  'domains',
  'assets',
  'html',
  'metrics',
  'text',
  'harstorer',
  'budget',
  'thirdparty',
  'tracestorer'
]);

const pluginsDir = path.join(__dirname, '..', 'plugins');

module.exports = {
  async parsePluginNames(options) {
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

    const files = await readdir(pluginsDir);
    const builtins = files.map(name => path.basename(name, '.js'));
    const plugins = builtins.filter(isDefaultOrConfigured);
    return addMessageLoggerIfDebug(plugins);
  },
  async loadPlugins(pluginNames) {
    const plugins = [];
    for (let name of pluginNames) {
      try {
        const plugin = require(path.join(pluginsDir, name));
        if (!plugin.name) {
          plugin.name = () => name;
        }
        plugins.push(plugin);
      } catch (err) {
        try {
          plugins.push(require(path.resolve(process.cwd(), name)));
        } catch (error) {
          console.error("Couldn't load plugin %s: %s", name, err); // eslint-disable-line no-console
          // if it fails here, let it fail hard
          throw error;
        }
      }
    }
    return plugins;
  }
};
