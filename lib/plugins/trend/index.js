import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { getLogger } from '@sitespeed.io/log';
import { get, set } from '../../support/objectPath.js';

import { runStatisticalTests } from '../compare/helper.js';
import { urlToId } from '../compare/index.js';
import {
  addTest,
  getWindows,
  getVerdict,
  BASELINE_TESTS,
  CURRENT_TESTS
} from './trend.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const log = getLogger('sitespeedio.plugin.trend');

const DEFAULT_METRICS_PAGESUMMARY = [
  'metrics.*.*.isSlower',
  'metrics.*.*.change'
];

async function readHistory(file) {
  try {
    return JSON.parse(await fs.readFile(file));
  } catch {
    return { tests: [] };
  }
}

export default class TrendPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'trend', options, context, queue });
  }

  async open(context, options) {
    this.options = options;
    this.trendOptions = options.trend;
    this.browsertimes = {};
    this.pug = readFileSync(
      path.resolve(__dirname, 'pug', 'index.pug'),
      'utf8'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGESUMMARY,
      'trend.pageSummary'
    );
  }

  async processMessage(message) {
    switch (message.type) {
      case 'sitespeedio.setup': {
        super.sendMessage('html.pug', {
          id: 'trend',
          name: 'Trend',
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
        for (const [url, browsertime] of Object.entries(this.browsertimes)) {
          await this.trend(url, browsertime);
        }
        break;
      }
    }
  }

  async trend(url, browsertime) {
    const file = path.resolve(
      this.trendOptions.path ||
        this.options.compare?.baselinePath ||
        process.cwd(),
      `${urlToId(url, this.options)}-trend.json`
    );
    const values = {};
    for (const metric of this.trendOptions.metrics) {
      const value = get(browsertime.data.statistics, `${metric}.median`);
      if (value !== undefined) {
        values[metric] = value;
      }
    }
    const missing = this.trendOptions.metrics.filter(
      metric => values[metric] === undefined
    );
    if (missing.length > 0) {
      log.warning(
        'The test of %s has no %s, so the trend cannot follow it. Check --trend.metrics',
        url,
        missing.join(', ')
      );
    }
    // A test without any of the metrics would count as a test in the
    // history but give nothing to compare
    if (Object.keys(values).length === 0) {
      const { tests } = await readHistory(file);
      return this.sendTrend(url, browsertime, tests, missing);
    }
    const history = addTest(
      await readHistory(file),
      browsertime.data.info.timestamp,
      values
    );
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(history));

    const input = {
      options: {
        test_type: 'mannwhitneyu',
        alternative: 'greater',
        use_continuity: false,
        method: 'auto',
        nan_policy: 'omit'
      },
      metrics: { trend: {} }
    };
    for (const metric of this.trendOptions.metrics) {
      const windows = getWindows(history, metric);
      if (windows) {
        input.metrics.trend[metric] = windows;
      }
    }
    if (Object.keys(input.metrics.trend).length === 0) {
      log.info(
        'The trend for %s starts when there are %s tests, now %s',
        url,
        BASELINE_TESTS + CURRENT_TESTS,
        history.tests.length
      );
      return this.sendTrend(url, browsertime, history.tests, missing);
    }

    const results = await runStatisticalTests(input);
    if (!results) {
      return this.sendTrend(url, browsertime, history.tests, missing);
    }
    const metrics = {};
    for (const [metric, windows] of Object.entries(input.metrics.trend)) {
      set(
        metrics,
        metric,
        getVerdict(
          windows.baseline,
          windows.current,
          results.trend[metric]['p-value'],
          this.trendOptions.minChangePercent,
          this.trendOptions.minChangeValue
        )
      );
    }
    return this.sendTrend(url, browsertime, history.tests, missing, metrics);
  }

  // Sent for every test, also before there are enough tests, so the HTML
  // can show the history. Graphite only gets the verdicts (the filter).
  sendTrend(url, browsertime, tests, missing, metrics = {}) {
    return super.sendMessage(
      'trend.pageSummary',
      {
        metrics,
        tests,
        missing,
        followed: this.trendOptions.metrics,
        required: BASELINE_TESTS + CURRENT_TESTS,
        currentTests: CURRENT_TESTS
      },
      {
        url,
        group: browsertime.group,
        runTime: browsertime.runTime
      }
    );
  }
}
