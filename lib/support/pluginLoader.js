'use strict';

const Promise = require('bluebird'),
  path = require('path'),
  fs = require('fs');

Promise.promisifyAll(fs);

const defaultPlugins = ['browsertime', 'coach', 'datacollector', 'domains', 'assets', 'html', 'screenshot','metrics', 'text', 'harstorer', 'budget'];

const pluginsDir = path.join(__dirname, '..', 'plugins');

module.exports = {
  getPluginNames(debug) {
    if (debug) {
      // Need to make sure logger is first, so message logs appear
      // before messages are handled by other plugins
      return ['messagelogger'].concat(defaultPlugins);
    }
    return defaultPlugins;
  },
  loadPlugins(pluginNames) {
   return Promise.resolve(pluginNames).map((name) => {
     try {
       return require(path.join(pluginsDir, name));
     } catch (err) {
       try {
         return require(path.resolve(process.cwd(), name));
      } catch(error) {
        console.error('Couldn\'t load plugin %s: %s', name, err); // eslint-disable-line no-console
        // if it fails here, let it fail hard
        throw error;
      }
     }
   });
 }
};
