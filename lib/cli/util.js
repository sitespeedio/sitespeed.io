/*eslint no-console: 0*/

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { format } from 'node:util';

import { toArray } from '../support/util.js';

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
    cliOptions !== undefined &&
    cliOptions.constructor === Object;

  if (!isValidType) {
    const current = format(cliOptions);
    throw new Error(`Invalid CLI options defined for plugin: ${current}`);
  }

  return cliOptions;
}

export function getURLs(urls) {
  const allUrls = [];
  urls = urls.map(url => url.trim());

  for (let url of urls) {
    if (url.startsWith('http')) {
      allUrls.push(url);
    } else {
      const filePath = resolve(url);
      try {
        const lines = readFileSync(filePath).toString().split('\n');
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
                // do nada
              }
            }
          }
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          throw new Error(`Couldn't find url file at ${filePath}`);
        }
        throw error;
      }
    }
  }
  return allUrls;
}
export function getAliases(urls, alias, groupAlias) {
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
      const lines = readFileSync(filePath).toString().split('\n');
      for (let line of lines) {
        if (line.trim().length > 0) {
          let url, alias, groupAlias;
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
}
export function pluginDefaults(cliOptions) {
  let config = {};
  try {
    for (const values of Object.entries(sanitizePluginOptions(cliOptions))) {
      const [key, options] = values;
      if (typeof options.default !== 'undefined') {
        config[key] = options.default;
      }
    }
  } catch {
    // In case of invalid values, just assume an empty object.
    config = {};
  }
  return config;
}
export function registerPluginOptions(parsed, plugin) {
  if (typeof plugin.name !== 'function' || !plugin.getName()) {
    throw new Error(
      'Missing getName() method for plugin registering CLI options'
    );
  }
  const cliOptions = sanitizePluginOptions(plugin.cliOptions);
  for (const value of Object.entries(cliOptions)) {
    const [key, yargsOptions] = value;
    parsed.option(`${plugin.getName()}.${key}`, yargsOptions);
  }
}
