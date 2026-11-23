import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import test from 'ava';
import pug from 'pug';

import TrendPlugin from '../lib/plugins/trend/index.js';
import { GraphiteDataGenerator } from '../lib/plugins/graphite/data-generator.js';
import * as filterRegistry from '../lib/support/filterRegistry.js';
import * as helpers from '../lib/support/helpers/index.js';
import { get } from '../lib/support/objectPath.js';
import {
  addTest,
  getWindows,
  getVerdict,
  BASELINE_TESTS,
  CURRENT_TESTS
} from '../lib/plugins/trend/trend.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const LCP = 'googleWebVitals.largestContentfulPaint';

function historyOf(values) {
  let history = { tests: [] };
  for (const [index, value] of values.entries()) {
    history = addTest(history, index, { [LCP]: value });
  }
  return history;
}

test('The history keeps only the tests the windows need', t => {
  const history = historyOf(Array.from({ length: 50 }, (_, index) => index));
  t.is(history.tests.length, BASELINE_TESTS + CURRENT_TESTS);
  t.is(history.tests.at(-1).values[LCP], 49);
});

test('No windows until there are enough tests', t => {
  t.is(getWindows(historyOf([1000, 1000, 1000]), LCP), undefined);
});

test('The current window is the last tests', t => {
  const values = [
    ...Array.from({ length: BASELINE_TESTS }).fill(1000),
    ...Array.from({ length: CURRENT_TESTS }).fill(1200)
  ];
  const windows = getWindows(historyOf(values), LCP);
  t.is(windows.baseline.length, BASELINE_TESTS);
  t.deepEqual(windows.current, [1200, 1200, 1200, 1200]);
});

test('A clear and big enough change is slower', t => {
  const verdict = getVerdict([1000, 1000, 1000], [1200, 1200], 0.001, 10, 100);
  t.is(verdict.isSlower, 1);
  t.is(verdict.change, 20);
});

test('A clear but too small change is not slower', t => {
  // 5% and 50 ms is below the default 10% and 100 ms
  t.is(getVerdict([1000, 1000], [1050, 1050], 0.001, 10, 100).isSlower, 0);
});

test('A big change that is not clear is not slower', t => {
  t.is(getVerdict([1000, 1000], [1200, 1200], 0.2, 10, 100).isSlower, 0);
});

test('Graphite gets isSlower and change for each page', t => {
  const options = {
    browser: 'chrome',
    slug: 'firstViewDocker',
    browsertime: { connectivity: { profile: '4g' } },
    graphite: { addSlugToKey: true }
  };
  const context = {
    messageMaker: () => ({ make: () => {} }),
    getLogger: () => {},
    filterRegistry
  };
  const plugin = new TrendPlugin(options, context, {
    postMessage: async () => {}
  });
  plugin.open(context, options);
  const message = filterRegistry.filterMessage({
    type: 'trend.pageSummary',
    url: 'https://en.wikipedia.org/wiki/Sweden',
    group: 'en.wikipedia.org',
    data: {
      metrics: {
        googleWebVitals: {
          largestContentfulPaint: {
            isSlower: 1,
            change: 21,
            pValue: 0.0001,
            baselineMedian: 1200,
            currentMedian: 1452
          }
        }
      }
    }
  });
  const lines = new GraphiteDataGenerator(
    'sitespeed_io.desktop',
    false,
    options
  ).dataFromMessage(message, new Date(0), {});
  const prefix =
    'sitespeed_io.desktop.firstViewDocker.pageSummary.en_wikipedia_org._wiki_Sweden.chrome.4g.trend.metrics.googleWebVitals.largestContentfulPaint';
  t.deepEqual(lines, [`${prefix}.isSlower 1 0`, `${prefix}.change 21 0`]);
});

test('A test without the followed metrics is not saved', async t => {
  // For example Safari before it reported googleWebVitals
  const folder = mkdtempSync(path.join(tmpdir(), 'trend-'));
  const options = {
    browser: 'safari',
    browsertime: { connectivity: {} },
    trend: { path: folder, metrics: [LCP] }
  };
  const context = {
    messageMaker: () => ({ make: () => {} }),
    getLogger: () => {},
    filterRegistry: { registerFilterForType: () => {} }
  };
  const plugin = new TrendPlugin(options, context, {
    postMessage: async () => {}
  });
  await plugin.open(context, options);
  await plugin.processMessage({
    type: 'browsertime.pageSummary',
    url: 'https://www.sitespeed.io/',
    group: 'www.sitespeed.io',
    data: { info: { timestamp: 0 }, statistics: { timings: {} } }
  });
  await plugin.processMessage({ type: 'sitespeedio.summarize' });
  t.false(existsSync(path.join(folder, 'www.sitespeed.io-safari-trend.json')));
});

test('Without --trend.path the history goes to --compare.baselinePath', async t => {
  const folder = mkdtempSync(path.join(tmpdir(), 'trend-'));
  const options = {
    browser: 'chrome',
    browsertime: { connectivity: {} },
    compare: { baselinePath: folder },
    trend: { metrics: [LCP], minChangePercent: 10, minChangeValue: 100 }
  };
  const context = {
    messageMaker: () => ({ make: () => {} }),
    getLogger: () => {},
    filterRegistry: { registerFilterForType: () => {} }
  };
  const plugin = new TrendPlugin(options, context, {
    postMessage: async () => {}
  });
  await plugin.open(context, options);
  await plugin.processMessage({
    type: 'browsertime.pageSummary',
    url: 'https://www.sitespeed.io/',
    group: 'www.sitespeed.io',
    data: {
      info: { timestamp: 0 },
      statistics: {
        googleWebVitals: { largestContentfulPaint: { median: 1000 } }
      }
    }
  });
  await plugin.processMessage({ type: 'sitespeedio.summarize' });
  const history = JSON.parse(
    readFileSync(path.join(folder, 'www.sitespeed.io-chrome-trend.json'))
  );
  t.is(history.tests.length, 1);
});

test('The plugin saves the history and sends the trend for each page', async t => {
  const folder = mkdtempSync(path.join(tmpdir(), 'trend-'));
  const messages = [];
  const options = {
    browser: 'chrome',
    browsertime: { connectivity: {} },
    trend: {
      path: folder,
      metrics: [LCP],
      minChangePercent: 10,
      minChangeValue: 100
    }
  };
  const context = {
    messageMaker: () => ({ make: (type, data) => ({ type, data }) }),
    getLogger: () => {},
    filterRegistry: { registerFilterForType: () => {} }
  };
  const queue = { postMessage: async message => messages.push(message) };
  const previousPython = process.env.PYTHON;
  process.env.PYTHON = path.join(
    __dirname,
    'data',
    'compare',
    'fakePython.mjs'
  );
  try {
    for (let index = 0; index < BASELINE_TESTS + CURRENT_TESTS; index++) {
      const plugin = new TrendPlugin(options, context, queue);
      await plugin.open(context, options);
      await plugin.processMessage({
        type: 'browsertime.pageSummary',
        url: 'https://www.sitespeed.io/',
        group: 'www.sitespeed.io',
        data: {
          info: { timestamp: index },
          statistics: {
            googleWebVitals: { largestContentfulPaint: { median: 1000 } }
          }
        }
      });
      await plugin.processMessage({ type: 'sitespeedio.summarize' });
    }
  } finally {
    if (previousPython === undefined) {
      delete process.env.PYTHON;
    } else {
      process.env.PYTHON = previousPython;
    }
  }

  const history = JSON.parse(
    readFileSync(path.join(folder, 'www.sitespeed.io-chrome-trend.json'))
  );
  t.is(history.tests.length, BASELINE_TESTS + CURRENT_TESTS);
  // A message for every test, so the HTML can show the history, and the
  // verdict from the test that fills the windows
  t.is(messages.length, BASELINE_TESTS + CURRENT_TESTS);
  t.deepEqual(messages[0].data.metrics, {});
  t.is(messages[0].data.tests.length, 1);
  const last = messages.at(-1);
  t.is(last.type, 'trend.pageSummary');
  t.is(last.data.tests.length, BASELINE_TESTS + CURRENT_TESTS);
  t.is(last.data.metrics.googleWebVitals.largestContentfulPaint.isSlower, 0);
});

function renderTab(pageSummary) {
  return pug.compileFile(
    path.join(__dirname, '..', 'lib', 'plugins', 'trend', 'pug', 'index.pug')
  )({
    pageInfo: { data: { trend: { pageSummary } } },
    options: { trend: { minChangePercent: 10, minChangeValue: 100 } },
    h: helpers,
    get
  });
}

test('The Trend tab tells which test this is until there are enough', t => {
  const html = renderTab({
    metrics: {},
    tests: [
      { timestamp: '2026-11-20T10:00:00+01:00', values: { [LCP]: 900 } },
      { timestamp: '2026-11-20T16:00:00+01:00', values: { [LCP]: 950 } }
    ],
    missing: [],
    followed: [LCP],
    required: BASELINE_TESTS + CURRENT_TESTS,
    currentTests: CURRENT_TESTS
  });
  t.regex(html, /This is test 2 of the 32 tests that the trend needs/);
  t.regex(html, /starts to compare after 30 more tests/);
  t.regex(html, /The first test in the history is from 2026-11-20 10:00/);
});

test('The Trend tab names the metric that got slower', t => {
  const tests = Array.from({ length: 32 }, (_, index) => ({
    timestamp: `2026-11-${String(10 + Math.floor(index / 4)).padStart(2, '0')}T10:00:00+01:00`,
    values: { [LCP]: index < 28 ? 1000 : 1200 }
  }));
  const html = renderTab({
    metrics: {
      googleWebVitals: {
        largestContentfulPaint: {
          isSlower: 1,
          change: 20,
          pValue: 0.0001,
          baselineMedian: 1000,
          currentMedian: 1200
        }
      }
    },
    tests,
    missing: [],
    followed: [LCP],
    required: BASELINE_TESTS + CURRENT_TESTS,
    currentTests: CURRENT_TESTS
  });
  t.regex(html, /Largest contentful paint got 20% slower/);
  t.regex(html, /cmp-chip--error">slower/);
});
