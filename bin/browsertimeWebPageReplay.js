#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const browsertime = require('browsertime');
const merge = require('lodash.merge');
const getURLs = require('../lib/cli/util').getURLs;
const browsertimeConfig = require('../lib/plugins/browsertime/index').config;

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

  const engine = new browsertime.Engine(btOptions);
  const urls = getURLs(parsed.argv._);

  await testURLs(engine, urls);

  process.exit();
}

runBrowsertime();
