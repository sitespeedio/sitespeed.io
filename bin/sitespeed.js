#!/usr/bin/env node

/*eslint no-console: 0*/

import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { platform } from 'node:os';
import { resolve, basename } from 'node:path';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';

import merge from 'lodash.merge';
import ora from 'ora';

import { parseCommandLine } from '../lib/cli/cli.js';
import { run } from '../lib/sitespeed.js';
import { addTest, waitAndGetResult, get } from '../lib/api/send.js';

// This is due to CDP do no have (or has it) a way to remove listeners
// and default 10 is quite small number.
EventEmitter.defaultMaxListeners = 30;

async function api(options) {
  const action = options.api.action ?? 'addAndGetResult';

  if (action === 'get' && !options.api.id) {
    process.exitCode = 1;
    console.log('Missing test id --api.id');
    process.exit();
  }

  const hostname = options.api.hostname;
  let apiOptions = options.explicitOptions;
  // Delete the hostname to make sure the server do not end in
  // a forever loop
  delete apiOptions.api.hostname;

  // Add support for running multi tests
  if (options.multi) {
    const scripting = await readFileSync(
      new URL(resolve(process.cwd(), options._[0]), import.meta.url)
    );
    apiOptions.api.scripting = scripting.toString();
    apiOptions.api.scriptingName = basename(options._[0]);
  }

  if (apiOptions.mobile) {
    apiOptions.api.testType = 'emulatedMobile';
  } else if (apiOptions.android) {
    apiOptions.api.testType = 'android';
  } else if (apiOptions.safari && apiOptions.safari.ios) {
    apiOptions.api.testType = 'ios';
  } else {
    apiOptions.api.testType = 'desktop';
  }

  if (options.config) {
    const config = JSON.parse(
      await readFileSync(
        new URL(resolve(process.cwd(), options.config), import.meta.url)
      )
    );
    apiOptions = merge(options.explicitOptions, config);
    delete apiOptions.config;
  }

  if (action === 'add' || action === 'addAndGetResult') {
    const spinner = ora({
      text: `Send test to ${hostname} testing ${options._[0]}`,
      isSilent: options.api.silent
    }).start();

    try {
      const data = await addTest(hostname, apiOptions);
      const testId = JSON.parse(data).id;
      spinner.color = 'yellow';
      spinner.text = `Added test ${options._[0]} with id ${testId}`;

      if (action === 'add') {
        spinner.succeed(`Added test ${options._[0]} with id ${testId}`);
        console.log(testId);
        process.exit();
      } else if (action === 'addAndGetResult') {
        const result = await waitAndGetResult(
          testId,
          hostname,
          apiOptions,
          spinner
        );
        if (result.status === 'completed') {
          spinner.succeed(`Got test result with id ${testId}`);
          if (options.api.json) {
            console.log(JSON.stringify(result));
          } else {
            console.log(result.result);
          }
        } else if (result.status === 'failed') {
          spinner.fail('Test failed');
          if (options.api.json) {
            console.log(JSON.stringify(result));
          }
          process.exitCode = 1;
          process.exit();
        }
      }
    } catch (error) {
      spinner.fail(error.message);
      process.exitCode = 1;
      process.exit();
    }
  } else if (action === 'get') {
    try {
      const result = await get(options.api.id, hostname, apiOptions);
      if (options.api.json) {
        console.log(JSON.stringify(result));
      } else {
        console.log(result);
      }
    } catch (error) {
      process.exitCode = 1;
      console.log(error);
    }
  }
}

async function start() {
  let parsed = await parseCommandLine();
  // hack for getting in the unchanged cli options
  parsed.options.explicitOptions = parsed.explicitOptions;
  parsed.options.urls = parsed.urls;
  parsed.options.urlsMetaData = parsed.urlsMetaData;

  let options = parsed.options;

  if (options.api && options.api.hostname && !options.disableAPI) {
    api(options);
  } else {
    try {
      const result = await run(options);

      // This can be used as an option to get hold of where the data is stored
      // for third parties
      if (options.storeResult) {
        if (options.storeResult == 'true') {
          writeFileSync('result.json', JSON.stringify(result));
        } else {
          // Use the name supplied
          writeFileSync(options.storeResult, JSON.stringify(result));
        }
      }

      if ((options.open || options.o) && platform() === 'darwin') {
        execSync('open ' + result.localPath + '/index.html');
      } else if ((options.open || options.o) && platform() === 'linux') {
        execSync('xdg-open ' + result.localPath + '/index.html');
      }

      // If one of the URLs is marked as a failure in Browsertime
      // then set the exit code
      for (let bt of result.browsertime) {
        if (bt.markedAsFailure === 1) {
          process.exitCode = 1;
        }
      }

      // If we have a failing budget, change the exit code
      if (
        parsed.options.budget &&
        Object.keys(result.budgetResult.failing).length > 0
      ) {
        process.exitCode = 1;
      }
      // If you supress the exit code using budgets, we will always return 0
      if (parsed.options.budget && parsed.options.budget.suppressExitCode) {
        process.exitCode = 0;
      }

      // If the exit code is still not set (it can be set in the scripting also)
      // Make sure we exit with a 0
      if (process.exitCode === undefined) {
        process.exitCode = 0;
      }

      if (result.errors.length > 0) {
        throw new Error('Errors while running:\n' + result.errors.join('\n'));
      }
    } catch {
      process.exitCode = 1;
    } finally {
      process.exit();
    }
  }
}

await start();
