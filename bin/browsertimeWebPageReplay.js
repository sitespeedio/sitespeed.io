#!/usr/bin/env node

'use strict';

let yargs = require('yargs'),
  browsertime = require('browsertime'),
  merge = require('lodash.merge'),
  getURLs = require('../lib/cli/util').getURLs,
  browsertimeConfig = require('../lib/plugins/browsertime/index').config;

async function testURL(engine, url) {
  await engine
    .start()
    .then(() => engine.run(url))
    .finally(() => engine.stop());
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
    speedIndex: false,
    resultDir: '/tmp/browsertime'
  };

  const btOptions = merge({}, parsed.argv.browsertime, defaultConfig);
  browsertime.logging.configure(parsed.argv);

  const engine = new browsertime.Engine(btOptions);
  const urls = getURLs(parsed.argv._);

  for (let url of urls) {
    await testURL(engine, url);
  }
}

runBrowsertime();
