#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const browsertime = require('browsertime');
const merge = require('lodash.merge');
const getURLs = require('../lib/cli/util').getURLs;
const get = require('lodash.get');
const browsertimeConfig = require('../lib/plugins/browsertime/index').config;

const iphone6UserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_3 like Mac OS X) AppleWebKit/536.26 ' +
  '(KHTML, like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25';

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
    .option('browsertime.chrome.mobileEmulation.deviceName', {
      describe:
        "Name of device to emulate. Works only standalone (see list in Chrome DevTools, but add phone like 'iPhone 6'). This will override your userAgent string.",
      group: 'chrome'
    })
    .option('browsertime.viewPort', {
      default: browsertimeConfig.viewPort,
      describe: 'The browser view port size WidthxHeight like 400x300',
      group: 'Browser'
    });

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
    resultDir: '/tmp/browsertime'
  };

  const btOptions = merge({}, parsed.argv.browsertime, defaultConfig);
  browsertime.logging.configure(parsed.argv);

  if (parsed.argv.mobile) {
    btOptions.viewPort = '360x640';
    if (btOptions.browser === 'chrome') {
      const emulation = get(
        btOptions,
        'chrome.mobileEmulation.deviceName',
        'iPhone 6'
      );
      btOptions.chrome.mobileEmulation = {
        deviceName: emulation
      };
    } else {
      btOptions.userAgent = iphone6UserAgent;
    }
  }

  const engine = new browsertime.Engine(btOptions);
  const urls = getURLs(parsed.argv._);

  await testURLs(engine, urls);

  process.exit();
}

runBrowsertime();
