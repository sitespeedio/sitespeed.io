import fs from 'node:fs/promises';
import path from 'node:path';

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
    context.filterRegistry.registerFilterForType(
      DEFAULT_METRICS_PAGESUMMARY,
      'trend.pageSummary'
    );
  }

  async processMessage(message) {
    switch (message.type) {
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
      return;
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
      return;
    }

    const results = await runStatisticalTests(input);
    if (!results) {
      return;
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
    super.sendMessage(
      'trend.pageSummary',
      { metrics },
      {
        url,
        group: browsertime.group,
        runTime: browsertime.runTime
      }
    );
  }
}
