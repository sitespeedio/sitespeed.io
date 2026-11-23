import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { getLogger } from '@sitespeed.io/log';
import { get, merge } from '../../support/objectPath.js';

import { compareTests } from './compare.js';
import { getBaseline, saveBaseline } from './baseline.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const log = getLogger('sitespeedio.plugin.compare');
const defaultConfig = {};

export function urlToId(url, options) {
  let id = url
    .replace(/^https?:\/\//, '')
    .replaceAll(/[^\d.A-Za-z]/g, '_')
    .replaceAll(/__+/g, '_')
    .replaceAll(/^_|_$/g, '');

  const connectivityProfile = get(options, 'browsertime.connectivity.profile');

  return `${options.slug ? options.slug + '-' : ''}${
    connectivityProfile ? connectivityProfile + '-' : ''
  }${id}${options.browser ? '-' + options.browser : ''}`;
}

// A replay gives the same responses every time, so the runs of a test are
// close and fewer of them are enough to find a change
export function minimumIterations(options) {
  return options.replay || options.webpagereplay ? 10 : 20;
}

const DEFAULT_METRICS_PAGESUMMARY = [
  'metrics.timings.*.statisticalTestU',
  'metrics.cpu.*.statisticalTestU',
  'metrics.cdp.*.statisticalTestU',
  'metrics.visualMetrics.*.statisticalTestU',
  'metrics.googleWebVitals.*.statisticalTestU',
  'metrics.renderBlocking.*.statisticalTestU',
  'metrics.elementTimings.*.statisticalTestU',
  'metrics.userTimings.*.statisticalTestU',
  'metrics.extras.*.statisticalTestU',
  'metrics.timings.*.isSignificant',
  'metrics.cpu.*.isSignificant',
  'metrics.cdp.*.isSignificant',
  'metrics.visualMetrics.*.isSignificant',
  'metrics.googleWebVitals.*.isSignificant',
  'metrics.renderBlocking.*.isSignificant',
  'metrics.elementTimings.*.isSignificant',
  'metrics.userTimings.*.isSignificant',
  'metrics.extras.*.isSignificant'
];

export default class ComparePlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'compare', options, context, queue });
  }

  async open(context, options) {
    this.pageXrays = {};
    this.browsertimes = {};
    this.page = 0;
    this.make = context.messageMaker('compare').make;
    this.compareOptions = merge({}, defaultConfig, options.compare);
    this.options = options;
    this.pug = readFileSync(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
    log.info(
      'Starting the compare plugin.' +
        (this.compareOptions.saveBaseline
          ? ' Will save this test as the baseline'
          : '')
    );
    const minimum = minimumIterations(options);
    if (options.browsertime.iterations < minimum) {
      log.warning(
        `You should use ${minimum}+ iterations to get statistical significant data`
      );
    }
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGESUMMARY,
      'compare.pageSummary'
    );
  }
  async processMessage(message) {
    switch (message.type) {
      case 'sitespeedio.setup': {
        super.sendMessage('compare.setup');
        // Add the HTML pugs
        super.sendMessage('html.pug', {
          id: 'compare',
          name: 'Compare',
          pug: this.pug,
          type: 'pageSummary'
        });
        break;
      }
      case 'browsertime.pageSummary': {
        this.browsertimes[message.url] = message;
        break;
      }
      case 'sitespeedio.summarize': {
        for (let url of Object.keys(this.browsertimes)) {
          this.page++;
          const id = this.options.compare.id || urlToId(url, this.options);
          const baseline = await getBaseline(
            id + '-' + this.page,
            this.compareOptions
          );
          if (this.options.compare.id) {
            log.info('Using id %s for page baseline', id);
          } else {
            log.info('Using auto generated id for the baseline: %s ', id);
          }

          if (baseline) {
            if (
              this.options.browsertime.iterations !==
              baseline.browsertime.timestamps.length
            )
              log.warning(
                'The baseline test has %s runs and you current have %s. You should make sure you test the same amount of runs',
                baseline.browsertime.timestamps.length,
                this.options.browsertime.iterations
              );
            log.info('Got a baseline:' + id + '-' + this.page);
            const { metrics, meta, raw } = await compareTests(
              baseline,
              {
                browsertime: this.browsertimes[url].data,
                pagexray: this.pageXrays[url].data
              },
              this.compareOptions,
              url,
              this.options.browsertime.iterations
            );

            if (this.compareOptions.saveBaseline) {
              await saveBaseline(
                {
                  browsertime: this.browsertimes[url].data,
                  pagexray: this.pageXrays[url].data
                },
                path.join(
                  this.compareOptions.baselinePath || process.cwd(),
                  `${id}-${this.page}.json`
                )
              );
            }

            super.sendMessage(
              'compare.pageSummary',
              { metrics, meta, raw },
              {
                url: url,
                group: this.browsertimes[url].group,
                runTime: this.browsertimes[url].runTime
              }
            );
          } else {
            if (this.compareOptions.saveBaseline) {
              await saveBaseline(
                {
                  browsertime: this.browsertimes[url].data,
                  pagexray: this.pageXrays[url].data
                },
                path.join(
                  this.compareOptions.baselinePath || process.cwd(),
                  `${id}-${this.page}.json`
                )
              );
            }
          }
        }
        break;
      }
      case 'pagexray.pageSummary': {
        this.pageXrays[message.url] = message;
        break;
      }
    }
  }
}
