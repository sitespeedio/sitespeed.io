import test from 'ava';

import LatestStorerPlugin from '../lib/plugins/lateststorer/index.js';

// The options as yargs gives them: the android.enabled alias always makes an
// android object, also on desktop
function options(extra = {}) {
  return {
    copyLatestFilesToBase: true,
    browser: 'chrome',
    viewPort: '1366x768',
    graphite: {},
    android: { enabled: false },
    browsertime: {
      iterations: 1,
      android: { enabled: false },
      safari: {},
      connectivity: { profile: 'native' }
    },
    ...extra
  };
}

async function friendlyHTML(options) {
  const written = [];
  const context = {
    messageMaker: () => ({ make: () => {} }),
    getLogger: () => {},
    storageManager: {
      getBaseDir: () => '/tmp/result/date',
      writeDataToDir: async data => written.push(JSON.parse(data))
    },
    timestamp: { format: () => '2026-11-17 10:00:00 +01:00' },
    resultUrls: { hasBaseUrl: () => false }
  };
  const plugin = new LatestStorerPlugin(options, context, {});
  plugin.open(context, options);
  await plugin.processMessage({
    type: 'browsertime.run',
    iteration: 1,
    url: 'https://www.sitespeed.io/',
    group: 'www.sitespeed.io',
    data: {}
  });
  return written[0].friendlyHTML;
}

test('Show the viewport for a desktop test', async t => {
  t.regex(await friendlyHTML(options()), /with viewport 1366x768/);
});

test('Do not show the viewport when you emulate mobile', async t => {
  t.notRegex(await friendlyHTML(options({ mobile: true })), /with viewport/);
});
