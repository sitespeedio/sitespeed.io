#!/usr/bin/env node

/*eslint no-console: 0*/

import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { platform } from 'node:os';
import { parseCommandLine } from '../lib/cli/cli.js';
import { run } from '../lib/sitespeed.js';

async function start() {
  let parsed = await parseCommandLine();
  let budgetFailing = false;
  // hack for getting in the unchanged cli options
  parsed.options.explicitOptions = parsed.explicitOptions;
  parsed.options.urls = parsed.urls;
  parsed.options.urlsMetaData = parsed.urlsMetaData;

  let options = parsed.options;
  process.exitCode = 1;
  try {
    const result = await run(options);

    if (options.storeResult) {
      if (options.storeResult == 'true') {
        writeFileSync('result.json', JSON.stringify(result));
      } else {
        writeFileSync(options.storeResult, JSON.stringify(result));
      }
    }

    if (result.errors.length > 0) {
      throw new Error('Errors while running:\n' + result.errors.join('\n'));
    }

    if ((options.open || options.o) && platform() === 'darwin') {
      execSync('open ' + result.localPath + '/index.html');
    } else if ((options.open || options.o) && platform() === 'linux') {
      execSync('xdg-open ' + result.localPath + '/index.html');
    }

    if (
      parsed.options.budget &&
      Object.keys(result.budgetResult.failing).length > 0
    ) {
      process.exitCode = 1;
      budgetFailing = true;
    }

    if (
      !budgetFailing ||
      (parsed.options.budget && parsed.options.budget.suppressExitCode)
    ) {
      process.exitCode = 0;
    }
  } catch (error) {
    process.exitCode = 1;
    console.log(error);
  } finally {
    process.exit();
  }
}

await start();
