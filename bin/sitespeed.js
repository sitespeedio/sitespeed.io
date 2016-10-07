#!/usr/bin/env node

/*eslint no-console: 0*/

'use strict';

const cli = require('../lib/support/cli'),
  sitespeed = require('../lib/sitespeed'),
  Promise = require('bluebird');

require('longjohn');
Promise.config({
  warnings: true,
  longStackTraces: true
});

process.exitCode = 1;

let parsed = cli.parseCommandLine();
let budgetFailing = false;

return sitespeed.run(parsed.options._, parsed.options)
  .then((result) => {
    if (result.errors.length > 0) {
      throw new Error('Errors while running:\n' + result.errors.join('\n'));
    }
    if (Object.keys(result.budgetResult.failing).length > 0) {
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
