import test from 'ava';
// eslint-disable-next-line unicorn/no-named-default
import { default as OpenSearchPlugin } from '../lib/plugins/opensearch/index.js';

// ---- Minimal Sitespeed context ----
function createContext() {
  return {
    messageMaker: () => ({
      make: () => {}
    }),
    storageManager: {},
    getLogger: () => ({
      info: () => {},
      error: () => {}
    })
  };
}

function createValidOptions() {
  return {
    opensearch: {
      host: 'localhost',
      port: 9200,
      protocol: 'http',
      index: 'test-index'
    }
  };
}

test('plugin initializes correctly with valid config', t => {
  const context = createContext();
  const options = createValidOptions();

  const plugin = new OpenSearchPlugin(options, context);
  plugin.open(context, options);

  t.is(plugin.index, 'test-index');
  t.truthy(plugin.client);
});

test('initializeClient throws when host missing', t => {
  const context = createContext();
  const options = {
    opensearch: {
      port: 9200,
      protocol: 'http',
      index: 'test-index'
    }
  };

  const plugin = new OpenSearchPlugin(options, context);

  const error = t.throws(() => {
    plugin.open(context, options);
  });

  t.is(error.message, 'OpenSearch host and port must be defined');
});

test('transformMetrics extracts metrics correctly', t => {
  const plugin = new OpenSearchPlugin({}, createContext());

  const input = {
    info: { url: 'https://example.com' },
    googleWebVitals: [
      {
        largestContentfulPaint: 2500,
        cumulativeLayoutShift: 0.2
      }
    ],
    browserScripts: [
      {
        timings: {
          pageTimings: {
            backEndTime: 50,
            domContentLoadedTime: 100,
            domInteractiveTime: 120,
            domainLookupTime: 20,
            frontEndTime: 300,
            pageLoadTime: 800,
            serverConnectionTime: 30,
            serverResponseTime: 60
          }
        }
      }
    ]
  };

  const result = plugin.transformMetrics(input);

  t.is(result.url, 'https://example.com');
  t.is(result.lcp, 2500);
  t.is(result.cls, 0.2);
  t.is(result.browserpbbackendtime, 50);
  t.is(result.browserpbpageLoadTime, 800);
});

test('transformMetrics handles missing data safely', t => {
  const plugin = new OpenSearchPlugin({}, createContext());

  const result = plugin.transformMetrics({});

  t.is(result.url, 'unknown');
  t.is(result.lcp, 0);
  t.is(result.cls, 0);
  t.is(result.browserpbpageLoadTime, 0);
});

test('sendMetricsToOpenSearch calls client.index', async t => {
  const context = createContext();
  const options = createValidOptions();

  const plugin = new OpenSearchPlugin(options, context);
  plugin.open(context, options);

  let indexCalled = false;

  plugin.client = {
    index: async params => {
      indexCalled = true;
      t.is(params.index, 'test-index');
      t.truthy(params.body);
      t.is(params.refresh, false);
      return { body: { _id: '123' } };
    }
  };

  await plugin.sendMetricsToOpenSearch({
    info: { url: 'https://example.com' }
  });

  t.true(indexCalled);
});

test('processMessage triggers indexing for browsertime.pageSummary', async t => {
  const context = createContext();
  const options = createValidOptions();

  const plugin = new OpenSearchPlugin(options, context);
  plugin.open(context, options);

  let called = false;

  plugin.sendMetricsToOpenSearch = async () => {
    called = true;
  };

  await plugin.processMessage({
    type: 'browsertime.pageSummary',
    data: { info: { url: 'https://example.com' } }
  });

  t.true(called);
});

test('processMessage ignores other message types', async t => {
  const plugin = new OpenSearchPlugin({}, createContext());

  let called = false;
  plugin.sendMetricsToOpenSearch = async () => {
    called = true;
  };

  await plugin.processMessage({
    type: 'other.message',
    data: {}
  });

  t.false(called);
});
