'use strict';

/*eslint no-console: 0*/

const fs = require('fs');
const path = require('path');
const toArray = require('../support/util').toArray;
const format = require('util').format;

/**
 *
 * @param {Object<string, any>} options The plugin options to normalise
 */
function sanitizePluginOptions(options) {
  // Allow .cliOptions to be defined either as a method, returning an object
  // or an object propety directly (computed or not)
  const cliOptions = typeof options === 'function' ? options() : options;

  const isValidType =
    typeof cliOptions === 'object' &&
    cliOptions !== null &&
    cliOptions.constructor === Object;

  if (!isValidType) {
    const current = format(cliOptions);
    throw new Error(`Invalid CLI options defined for plugin: ${current}`);
  }

  return cliOptions;
}

module.exports = {
  getURLs(urls) {
    const allUrls = [];
    urls = urls.map(url => url.trim());

    for (let url of urls) {
      if (url.startsWith('http')) {
        allUrls.push(url);
      } else {
        const filePath = path.resolve(url);
        try {
          const lines = fs.readFileSync(filePath).toString().split('\n');
          for (let line of lines) {
            if (line.trim().length > 0) {
              let lineArray = line.split(' ', 2);
              let url = lineArray[0].trim();
              if (url) {
                if (url.startsWith('http')) {
                  allUrls.push(url);
                } else if (url.startsWith('module.exports')) {
                  // This looks like someone is trying to run a script without adding the --multi parameter
                  // For now just write to the log and in the future we can maybe automatically fix it
                  console.error(
                    'Please use --multi if you want to run scripts. See https://www.sitespeed.io/documentation/sitespeed.io/scripting/#run'
                  );
                } else {
                  // We use skip adding it
                }
              }
            }
          }
        } catch (e) {
          if (e.code === 'ENOENT') {
            throw new Error(`Couldn't find url file at ${filePath}`);
          }
          throw e;
        }
      }
    }
    return allUrls;
  },
  getAliases(urls, alias, groupAlias) {
    const urlMetaData = {};
    urls = urls.map(url => url.trim());
    let al = toArray(alias);
    let allGroupAlias = toArray(groupAlias);
    let pos = 0;

    for (let url of urls) {
      if (url.startsWith('http')) {
        if (al.length > 0 && al[pos]) {
          urlMetaData[url] = { urlAlias: al[pos] };
        }
        if (allGroupAlias.length > 0 && allGroupAlias[pos]) {
          urlMetaData[url] = { groupAlias: allGroupAlias[pos] };
        }
        pos += 1;
      } else {
        const filePath = url;
        const lines = fs.readFileSync(filePath).toString().split('\n');
        for (let line of lines) {
          if (line.trim().length > 0) {
            let url,
              alias,
              groupAlias = null;
            let lineArray = line.split(' ', 3);
            url = lineArray[0].trim();
            if (lineArray[1]) {
              alias = lineArray[1].trim();
            }
            if (lineArray[2]) {
              groupAlias = lineArray[2].trim();
            }
            if (url && alias) {
              urlMetaData[url] = { urlAlias: alias };
            }
            if (url && groupAlias) {
              urlMetaData[url].groupAlias = groupAlias;
            }
          }
        }
      }
    }
    return urlMetaData;
  },

  /**
   * Retrieve a mapping of option names and their corressponding default values based on a plugin CLI configuration
   *
   * @param {Object<string, require('yargs').Options>} cliOptions a map of option names: yargs option
   */
  pluginDefaults(cliOptions) {
    let config = {};
    try {
      Object.entries(sanitizePluginOptions(cliOptions)).forEach(values => {
        const [key, options] = values;
        if (typeof options.default !== 'undefined') {
          config[key] = options.default;
        }
      });
    } catch (err) {
      // In case of invalid values, just assume an empty object.
      config = {};
    }
    return config;
  },

  /**
   * Configure yargs options for a given plugin defining a `cliOptions` method or property. The names
   * of configuration options are namespaced with the plugin name.
   *
   * @param {require('yargs').Argv} parsed yargs instance
   * @param {object} plugin a sitespeed plugin instance
   */
  registerPluginOptions(parsed, plugin) {
    if (typeof plugin.name !== 'function' || !plugin.name()) {
      throw new Error(
        'Missing name() method for plugin registering CLI options'
      );
    }
    const cliOptions = sanitizePluginOptions(plugin.cliOptions);
    Object.entries(cliOptions).forEach(value => {
      const [key, yargsOptions] = value;
      parsed.option(`${plugin.name()}.${key}`, yargsOptions);
    });
  }
};
