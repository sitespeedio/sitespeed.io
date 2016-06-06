#!/usr/bin/env node

/*eslint no-console: 0*/

'use strict';

const cli = require('../lib/support/cli'),
  sitespeed = require('../lib/sitespeed'),
  Promise = require('bluebird'),
  loader = require('../lib/support/pluginLoader');

require('longjohn');
Promise.config({
  warnings: true,
  longStackTraces: true
});

process.exitCode = 1;

let parsed = cli.parseCommandLine();

loader.parsePluginNames(parsed.explicitOptions)
  .then((pluginNames) => {
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
