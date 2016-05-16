#!/usr/bin/env node
/*eslint no-console: 0*/

'use strict';

const cli = require('../lib/support/cli'),
  App = require('../lib/app'),
  Promise = require('bluebird'),
  difference = require('lodash.difference'),
  logging = require('../lib/support/logging'),
  log = require('intel'),
  os = require('os'),
  packageInfo = require('../package'),
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
logging.configure(parsed.options);

if (log.isEnabledFor(log.CRITICAL)) { // TODO change the threshold to VERBOSE before releasing 4.0
  Promise.longStackTraces();
}

log.info('Versions OS: %s sitespeed.io: %s browsertime: %s coach: %s', os.platform() + ' ' + os.release(), packageInfo.version, packageInfo.dependencies.browsertime, packageInfo.dependencies.webcoach);

loader.parsePluginNames(parsed.explicitOptions)
  .then((pluginNames) => {
    if (allInArray(['browsertime', 'coach'], pluginNames)) {
      parsed.options.browsertime = merge({}, parsed.options.browsertime, {coach: true});
    }
    return loader.loadPlugins(pluginNames);
  })
  .then((plugins) => {
    let app = new App(plugins, parsed.options);

    return app.run()
      .then((errors) => {
        if (errors.length > 0) {
          throw new Error('Errors while running:\n' + errors.join('\n'));
        }
      });
  })
  .then(() => {
    process.exitCode = 0;
    log.info('Finished analysing ' + parsed.url);
  })
  .catch((e) => {
    process.exitCode = 1;
    log.error('Failing: ' + e.message);
  })
  .finally(() => process.exit());
