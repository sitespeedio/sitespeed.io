#!/usr/bin/env node

/*eslint no-console: 0*/

'use strict';

const cli = require('../lib/support/cli'),
  Sitespeed = require('../lib/sitespeed'),
  Promise = require('bluebird'),
  difference = require('lodash.difference'),
  merge = require('lodash.merge'),
  loader = require('../lib/support/pluginLoader');

require('longjohn');
Promise.config({
  warnings: true,
  longStackTraces: true
});

function allInArray(sampleArray, referenceArray) {
  return difference(sampleArray, referenceArray).length === 0;
}

process.exitCode = 1;

let parsed = cli.parseCommandLine();

loader.parsePluginNames(parsed.explicitOptions)
  .then((pluginNames) => {
    if (allInArray(['browsertime', 'coach'], pluginNames)) {
      parsed.options.browsertime = merge({}, parsed.options.browsertime, {
        coach: true
      });
    }
    return pluginNames;
  })
  .then((pluginNames) => {
    let sitespeed = new Sitespeed();

    return sitespeed.run(pluginNames, parsed.options)
      .then((errors) => {
        if (errors.length > 0) {
          throw new Error('Errors while running:\n' + errors.join('\n'));
        }
      });
  })
  .then(() => {
    process.exitCode = 0;
  })
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(() => process.exit());
