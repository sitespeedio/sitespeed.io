#!/usr/bin/env node

/*eslint no-console: 0*/

'use strict';

const cli = require('../lib/support/cli'),
  sitespeed = require('../lib/sitespeed'),
  Promise = require('bluebird'),
  browsertimeCli = require('browsertime').cli;

if (process.env.NODE_ENV !== 'production') {
  require('longjohn');
}

let browsertimeOptions = browsertimeCli.getOptions({
  group: 'Browser',
  prefix: 'browsertime.',
  forceGroup: true
});

Promise.config({
  warnings: true,
  longStackTraces: true
});

process.exitCode = 1;

let budgetFailing = false;

let parsed = cli.parseCommandLine(browsertimeOptions);
// hack for getting in the unchanged cli options
parsed.options.explicitOptions = parsed.explicitOptions;
parsed.options.urls = parsed.urls;

return sitespeed.run(parsed.options)
  .then((result) => {
    if (result.errors.length > 0) {
      throw new Error('Errors while running:\n' + result.errors.join('\n'));
    }
    if (parsed.options.budget && Object.keys(result.budgetResult.failing).length > 0) {
      process.exitCode = 1;
      budgetFailing = true;
    }
  })
  .then(() => {
    if (!budgetFailing) {
      process.exitCode = 0;
    }
  })
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(() => process.exit());
