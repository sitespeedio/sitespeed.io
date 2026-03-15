import path from 'node:path';
import { readFileSync, statSync } from 'node:fs';

import friendlynames from '../support/friendlynames.js';
import { config as htmlConfig } from '../plugins/html/index.js';
import { toArray } from '../support/util.js';
import { getURLs } from './util.js';

const metricList = Object.keys(friendlynames);

export function validateInput(argv) {
  // Check NodeJS major version
  const fullVersion = process.versions.node;
  const minVersion = 20;
  const majorVersion = fullVersion.split('.')[0];
  if (majorVersion < minVersion) {
    return (
      'Error: You need to have at least NodeJS version ' +
      minVersion +
      ' to run sitespeed.io. You are using version ' +
      fullVersion
    );
  }

  if (argv.headless && (argv.video || argv.visualMetrics)) {
    return 'Error: You cannot combine headless with video/visualMetrics because they need a screen to work.';
  }

  if (Array.isArray(argv.browsertime.iterations)) {
    return 'Error: Ooops you passed number of iterations twice, remove one of them and try again.';
  }

  if (Array.isArray(argv.browser)) {
    return 'Error: You can only run with one browser at a time.';
  }

  if (argv.outputFolder && argv.copyLatestFilesToBase) {
    return 'Error: Setting --outputfolder do not work together with --copyLatestFilesToBase';
  }

  if (argv.slug) {
    const characters = /[^\w-]/g;
    if (characters.test(argv.slug)) {
      return 'The slug can only use characters A-Z a-z 0-9 and -_.';
    }
    if (argv.slug.length > 200) {
      return 'The max length for the slug is 200 characters.';
    }
  }

  if (argv.crawler && argv.crawler.depth && argv.multi) {
    return 'Error: Crawl do not work running in multi mode.';
  }

  if (argv.crux && argv.crux.key && argv.multi) {
    return 'Error: Getting CrUx data do not work running in multi mode.';
  }

  /*
  if (argv.browsertime.cpu && argv.browsertime.enableProfileRun) {
    return 'Error: Use either --cpu or --enableProfileRun. Profile run will run one extra iteration to collect cpu/trace data.';
  }*/

  if (
    argv.urlAlias &&
    argv._ &&
    getURLs(argv._).length !== toArray(argv.urlAlias).length
  ) {
    return 'Error: You have a miss match between number of alias and URLs.';
  }

  if (
    argv.groupAlias &&
    argv._ &&
    getURLs(argv._).length !== toArray(argv.groupAlias).length
  ) {
    return 'Error: You have a miss match between number of alias for groups and URLs.';
  }

  if (
    argv.browsertime.connectivity &&
    argv.browsertime.connectivity.engine === 'humble' &&
    (!argv.browsertime.connectivity.humble ||
      !argv.browsertime.connectivity.humble.url)
  ) {
    return 'You need to specify the URL to Humble by using the --browsertime.connectivity.humble.url option.';
  }

  if (
    argv.browsertime.safari &&
    argv.browsertime.safari.useSimulator &&
    argv.browsertime.docker
  ) {
    return 'You cannot use Safari simulator in Docker. You need to run on directly on Mac OS.';
  }

  if (
    argv.browsertime.safari &&
    argv.browsertime.safari.useSimulator &&
    !argv.browsertime.safari.deviceUDID
  ) {
    return 'You need to specify the --safari.deviceUDID when you run the simulator. Run "xcrun simctl list devices" in your terminal to list all devices.';
  }

  if (argv.browsertime.debug && argv.browsertime.browser === 'safari') {
    return 'Debug mode do not work in Safari. Please try with Firefox/Chrome or Edge';
  }

  if (argv.browsertime.debug && argv.android) {
    return 'Debug mode do not work on Android. Please run debug mode on Desktop.';
  }

  if (argv.browsertime.debug && argv.docker) {
    return 'There is no benefit running debug mode inside a Docker container.';
  }

  // If we ask the API for finished test, we don't need a URL
  if (argv._.length === 0 && !argv.api.id) {
    return 'You need to supply one/multiple URLs or scripts';
  }

  // validate URLs/files
  const urlOrFiles = argv._;
  for (let urlOrFile of urlOrFiles) {
    if (!urlOrFile.startsWith('http')) {
      // is existing file?
      try {
        statSync(urlOrFile);
      } catch {
        return (
          'Error: ' +
          urlOrFile +
          ' does not exist, is the path to the file correct?'
        );
      }
    }
  }

  for (let metric of toArray(argv.html.pageSummaryMetrics)) {
    const [m, k] = metric.split('.');
    if (
      !metricList.some(
        tools => friendlynames[tools][m] && friendlynames[tools][m][k]
      )
    ) {
      return 'Error: Require summary page metrics to be from given array';
    }
  }

  for (let metric of toArray(argv.html.summaryBoxes)) {
    if (!htmlConfig.html.summaryBoxes.includes(metric)) {
      return `Error: ${metric} is not part of summary box metric.`;
    }
  }

  if (argv.html && argv.html.summaryBoxesThresholds) {
    try {
      const box = readFileSync(path.resolve(argv.html.summaryBoxesThresholds), {
        encoding: 'utf8'
      });
      argv.html.summaryBoxesThresholds = JSON.parse(box);
    } catch (error) {
      return (
        'Error: Could not read ' +
        argv.html.summaryBoxesThresholds +
        ' ' +
        error
      );
    }
  }

  return true;
}
