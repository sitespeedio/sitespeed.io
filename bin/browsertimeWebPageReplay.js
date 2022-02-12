#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const browsertime = require('browsertime');
const merge = require('lodash.merge');
const getURLs = require('../lib/cli/util').getURLs;
const get = require('lodash.get');
const set = require('lodash.set');
const findUp = require('find-up');
const fs = require('fs');
const browsertimeConfig = require('../lib/plugins/browsertime/index').config;

const iphone6UserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_3 like Mac OS X) AppleWebKit/536.26 ' +
  '(KHTML, like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25';

const configPath = findUp.sync(['.sitespeed.io.json']);
let config;

try {
  config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};
} catch (e) {
  if (e instanceof SyntaxError) {
    /* eslint no-console: off */
    console.error(
      'Could not parse the config JSON file ' +
        configPath +
        '. Is the file really valid JSON?'
    );
  }
  throw e;
}

async function testURLs(engine, urls) {
  try {
    await engine.start();
    for (let url of urls) {
      const result = await engine.run(url);
      for (let errors of result[0].errors) {
        if (errors.length > 0) {
          process.exitCode = 1;
        }
      }
    }
  } finally {
    engine.stop();
  }
}

async function runBrowsertime() {
  let parsed = yargs
    .env('SITESPEED_IO')
    .require(1, 'urlOrFile')
    .option('browsertime.browser', {
      alias: ['b', 'browser'],
      default: browsertimeConfig.browser,
      describe: 'Choose which Browser to use when you test.',
      choices: ['chrome', 'firefox'],
      group: 'Browser'
    })
    .option('mobile', {
      describe:
        'Access pages as mobile a fake mobile device. Set UA and width/height. For Chrome it will use device Apple iPhone 6.',
      default: false,
      type: 'boolean'
    })
    .option('browsertime.pageCompleteCheckPollTimeout', {
      alias: 'pageCompleteCheckPollTimeout',
      type: 'number',
      default: 200,
      describe:
        'The time in ms to wait for running the page complete check the next time.'
    })
    .option('browsertime.pageCompleteCheckStartWait', {
      alias: 'pageCompleteCheckStartWait',
      type: 'number',
      default: 500,
      describe:
        'The time in ms to wait for running the page complete check for the first time. Use this when you have a pageLoadStrategy set to none'
    })
    .option('browsertime.pageLoadStrategy', {
      alias: 'pageLoadStrategy',
      type: 'string',
      default: 'normal',
      choices: ['eager', 'none', 'normal'],
      describe:
        'Set the strategy to waiting for document readiness after a navigation event. After the strategy is ready, your pageCompleteCheck will start runninhg. This only for Firefox and Chrome and please check which value each browser implements.'
    })
    .option('browsertime.cpu', {
      alias: 'cpu',
      type: 'boolean',
      describe: 'Easy way to enable both chrome.timeline and CPU long tasks.',
      group: 'chrome'
    })
    .option('browsertime.chrome.CPUThrottlingRate', {
      alias: 'chrome.CPUThrottlingRate',
      type: 'number',
      describe:
        'Enables CPU throttling to emulate slow CPUs. Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc)',
      group: 'chrome'
    })
    .option('config', {
      describe:
        'Path to JSON config file. You can also use a .browsertime.json file that will automatically be found by Browsertime using find-up.',
      config: 'config'
    })
    .option('browsertime.viewPort', {
      alias: 'viewPort',
      default: browsertimeConfig.viewPort,
      describe: 'The browser view port size WidthxHeight like 400x300',
      group: 'Browser'
    })
    .option('browsertime.android', {
      alias: 'android',
      type: 'boolean',
      default: false,
      describe:
        'Short key to use Android. Will automatically use com.android.chrome for Chrome and stable Firefox. If you want to use another Chrome version, use --chrome.android.package'
    })
    .config(config);

  const defaultConfig = {
    iterations: 1,
    connectivity: {
      profile: 'native',
      downstreamKbps: undefined,
      upstreamKbps: undefined,
      latency: undefined,
      engine: 'external'
    },
    viewPort: '1366x708',
    delay: 0,
    video: false,
    visualMetrics: false,
    resultDir: '/tmp/browsertime',
    chrome: {
      ignoreCertificateErrors: true
    }
  };

  const btOptions = merge({}, parsed.argv.browsertime, defaultConfig);
  browsertime.logging.configure(parsed.argv);

  // We have a special hack in sitespeed.io when you set --mobile
  if (parsed.argv.mobile) {
    btOptions.viewPort = '360x640';
    btOptions['view-port'] = '360x640';
    if (btOptions.browser === 'chrome') {
      const emulation = get(
        btOptions,
        'chrome.mobileEmulation.deviceName',
        'Moto G4'
      );
      btOptions.chrome.mobileEmulation = {
        deviceName: emulation
      };
    } else {
      btOptions.userAgent = iphone6UserAgent;
    }
  }

  if (parsed.argv.android) {
    if (parsed.argv.browser === 'chrome') {
      // Default to Chrome Android.
      set(
        btOptions,
        'chrome.android.package',
        get(btOptions, 'chrome.android.package', 'com.android.chrome')
      );
    }
  }
  const engine = new browsertime.Engine(btOptions);
  const urls = getURLs(parsed.argv._);

  try {
    await testURLs(engine, urls);
  } catch (e) {
    console.error('Could not run ' + e);
    process.exit(1);
  }

  process.exit();
}

runBrowsertime();
