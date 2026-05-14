/*eslint no-console: 0*/

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { format } from 'node:util';

import { toArray } from '../support/util.js';

const SCRIPT_EXTENSIONS = new Set(['.js', '.cjs', '.mjs']);

// Classify a CLI positional argument as either an HTTP(S) URL, a URL-list
// file (lines of URLs, what `getURLs` reads) or a Browsertime script file
// (user journey). Used to auto-enable multi mode when a script is passed,
// so users don't need to remember --multi.
export function classifyInput(argument) {
  const trimmed = String(argument).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return 'url';
  }
  const extension = path.extname(trimmed).toLowerCase();
  if (SCRIPT_EXTENSIONS.has(extension)) {
    return 'script';
  }
  // No script extension: sniff the file. First non-empty line that starts
  // with http -> URL-list file; otherwise treat it as a script. Unreadable
  // paths fall through to 'urls-file' so existing ENOENT messages from
  // getURLs still surface to the user.
  try {
    const filePath = path.resolve(trimmed);
    const content = readFileSync(filePath, { encoding: 'utf8' });
    for (const line of content.split('\n')) {
      const t = line.trim();
      if (t.length === 0) continue;
      return t.startsWith('http') ? 'urls-file' : 'script';
    }
    return 'urls-file';
  } catch {
    return 'urls-file';
  }
}

export function hasScriptInput(arguments_) {
  return arguments_.some(argument => classifyInput(argument) === 'script');
}

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
  // Skip script files: they live alongside URLs/URL-list files in mixed
  // mode (e.g. `login.js https://x.com logout.js`) and should not be parsed
  // as URL-list text. Auto-detection in cli.js flips --multi on for these.
  urls = urls
    .map(url => url.trim())
    .filter(url => classifyInput(url) !== 'script');

  for (let url of urls) {
    if (url.startsWith('http')) {
      allUrls.push(url);
    } else {
      const filePath = path.resolve(url);
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
  // Same script-skip rationale as getURLs above.
  urls = urls
    .map(url => url.trim())
    .filter(url => classifyInput(url) !== 'script');
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
          // Only treat the line's first token as a URL if it actually
          // looks like one. Without this guard a non-URL-list file (e.g.
          // a .cjs scripting file passed without --multi) gets parsed
          // here and every JS identifier ends up as a key in urlMetaData,
          // which later crashes `new URL(token)` downstream and spams
          // "Could not get group for URL:<token>" errors. Mirrors the
          // same guard already in `getURLs` above.
          if (!url.startsWith('http')) {
            continue;
          }
          if (lineArray[1]) {
            alias = lineArray[1].trim();
          }
          if (lineArray[2]) {
            groupAlias = lineArray[2].trim();
          }
          if (alias) {
            urlMetaData[url] = { urlAlias: alias };
          }
          if (groupAlias) {
            urlMetaData[url] = urlMetaData[url] || {};
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
      if (options.default !== undefined) {
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
