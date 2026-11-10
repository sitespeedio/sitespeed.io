import path from 'node:path';
import { tmpdir } from 'node:os';

import test from 'ava';
import { getLogger } from '@sitespeed.io/log';

import LatestStorerPlugin from '../lib/plugins/lateststorer/index.js';
import { messageMaker } from '../lib/support/messageMaker.js';
import timestamp from '../lib/support/time.js';

const url = 'https://www.sitespeed.io/';
const baselineTimestamp = '2023-12-19 14:18:42';

function setup(overrides = {}) {
  const writes = [];
  const copies = [];
  const options = {
    copyLatestFilesToBase: true,
    browser: 'chrome',
    viewPort: '1280x720',
    browsertime: { iterations: 2, connectivity: { profile: 'native' } },
    graphite: {},
    ...overrides
  };
  const directory = path.join(tmpdir(), 'sitespeed-lateststorer');
  const context = {
    messageMaker,
    getLogger,
    timestamp: timestamp('2023-12-21T13:10:58Z'),
    resultUrls: { hasBaseUrl: () => false },
    storageManager: {
      getBaseDir: () => path.join(directory, '2023-12-21-13-10-58'),
      async writeDataToDir(data, filename, directory) {
        writes.push({ json: JSON.parse(data), filename, directory });
      },
      async copyFileToDir(source, destination) {
        copies.push({ source, destination });
      }
    }
  };
  const plugin = new LatestStorerPlugin(options, context);
  plugin.open(context, options);
  return { plugin, writes, copies, directory };
}

function runMessage(pageUrl = url, iteration = 1) {
  return {
    type: 'browsertime.run',
    url: pageUrl,
    group: 'www.sitespeed.io',
    iteration,
    data: { title: 'Sitespeed.io' }
  };
}

function compareMessage(pageUrl = url, date = baselineTimestamp) {
  return {
    type: 'compare.pageSummary',
    url: pageUrl,
    data: { meta: { baseline: { timestamp: date } } }
  };
}

test('latest metadata includes the comparison baseline after summarizing', async t => {
  const { plugin, writes, directory } = setup();
  await plugin.processMessage({ type: 'compare.setup' });
  await plugin.processMessage(runMessage());
  t.is(writes.length, 0);

  await plugin.processMessage(compareMessage());
  await plugin.processMessage({ type: 'sitespeedio.prepareToRender' });

  t.is(writes.length, 1);
  t.is(writes[0].directory, directory);
  t.true(writes[0].filename.endsWith('.chrome.native.json'));
  t.deepEqual(writes[0].json.compare, { enabled: true, baselineTimestamp });
  t.true(
    writes[0].json.friendlyHTML.includes(
      `using the compare plugin against baseline from ${baselineTimestamp}`
    )
  );
});

test('an enabled compare plugin is reported without an existing baseline', async t => {
  const { plugin, writes } = setup();
  await plugin.processMessage({ type: 'compare.setup' });
  await plugin.processMessage(runMessage());
  await plugin.processMessage({ type: 'sitespeedio.prepareToRender' });

  t.deepEqual(writes[0].json.compare, { enabled: true });
  t.true(writes[0].json.friendlyHTML.includes('using the compare plugin'));
  t.false(writes[0].json.friendlyHTML.includes('baseline'));
});

test('compare options alone do not report an excluded plugin as enabled', async t => {
  const { plugin, writes } = setup({ compare: { saveBaseline: true } });
  await plugin.processMessage(runMessage());
  await plugin.processMessage({ type: 'sitespeedio.prepareToRender' });

  const json = writes[0].json;
  t.false(Object.hasOwn(json, 'compare'));
  t.false(json.friendlyHTML.includes('compare'));
  t.is(json.url, url);
  t.is(json.title, 'Sitespeed.io');
  t.is(json.iterations, 2);
  t.deepEqual(json.browser, { name: 'Unknown', version: 'unknown' });
});

test('baseline timestamps stay associated with their page URL', async t => {
  const { plugin, writes } = setup();
  const otherUrl = 'https://www.sitespeed.io/documentation/';
  const thirdUrl = 'https://www.sitespeed.io/about/';
  const otherTimestamp = '2023-12-20 10:00:00';
  await plugin.processMessage({ type: 'compare.setup' });
  for (const pageUrl of [url, otherUrl, thirdUrl]) {
    await plugin.processMessage(runMessage(pageUrl));
  }
  await plugin.processMessage(compareMessage(otherUrl, otherTimestamp));
  await plugin.processMessage(compareMessage());
  await plugin.processMessage({ type: 'sitespeedio.prepareToRender' });

  t.is(writes.length, 3);
  t.is(writes[0].json.compare.baselineTimestamp, baselineTimestamp);
  t.is(writes[1].json.compare.baselineTimestamp, otherTimestamp);
  t.deepEqual(writes[2].json.compare, { enabled: true });
});

test('only the first iteration produces latest metadata', async t => {
  const { plugin, writes } = setup();
  await plugin.processMessage(runMessage());
  await plugin.processMessage(runMessage(url, 2));
  await plugin.processMessage({ type: 'sitespeedio.prepareToRender' });

  t.is(writes.length, 1);
});

test('disabled latest file copying does not write comparison metadata', async t => {
  const { plugin, writes } = setup({ copyLatestFilesToBase: false });
  await plugin.processMessage({ type: 'compare.setup' });
  await plugin.processMessage(runMessage());
  await plugin.processMessage(compareMessage());
  await plugin.processMessage({ type: 'sitespeedio.prepareToRender' });

  t.is(writes.length, 0);
});

test('screenshots and video are still copied during the first run', async t => {
  const { plugin, writes, copies } = setup({
    browsertime: {
      iterations: 2,
      connectivity: { profile: 'native' },
      video: true
    }
  });
  await plugin.processMessage({
    type: 'browsertime.config',
    data: { screenshot: true, screenshotType: 'png' }
  });
  const message = runMessage();
  message.data.screenshots = ['screenshots/afterPageCompleteCheck.png'];
  message.data.video = 'video/1.mp4';
  await plugin.processMessage(message);

  t.is(copies.length, 2);
  t.true(copies[0].destination.endsWith('.chrome.native.png'));
  t.true(copies[1].destination.endsWith('.chrome.native.mp4'));
  t.is(writes.length, 0);
});
