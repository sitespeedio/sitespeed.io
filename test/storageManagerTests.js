import path from 'node:path';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { Readable } from 'node:stream';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

import dayjs from 'dayjs';
import test from 'ava';

import { resultsStorage } from '../lib/core/resultsStorage/index.js';

const timestamp = dayjs();
const timestampString = timestamp.format('YYYY-MM-DD-HH-mm-ss');

function createManager(url, outputFolder) {
  return resultsStorage(url, timestamp, { outputFolder }).storageManager;
}

test(`Create path from url`, t => {
  const storageManager = createManager('http://www.foo.bar');
  const path = storageManager.rootPathFromUrl('http://www.foo.bar/x/y/z.html');
  t.is(path, '../../../../../');
});

test(`Create path from url with query string`, t => {
  const storageManager = createManager('http://www.foo.bar');
  const path = storageManager.rootPathFromUrl(
    'http://www.foo.bar/x/y/z?foo=bar'
  );
  t.is(path, '../../../../../../');
});

test(`Create base dir with default output folder`, t => {
  const storageManager = createManager('http://www.foo.bar');
  t.is(
    storageManager.getBaseDir(),
    path.resolve('sitespeed-result', 'www.foo.bar', timestampString)
  );
});

test(`Create base dir with custom output folder`, t => {
  const storageManager = createManager(
    'http://www.foo.bar',
    '/tmp/sitespeed.io/foo'
  );
  t.is(storageManager.getBaseDir(), '/tmp/sitespeed.io/foo');
});

test(`Create prefix with default output folder`, t => {
  const storageManager = createManager('http://www.foo.bar');
  t.is(
    storageManager.getStoragePrefix(),
    path.join('www.foo.bar', timestampString)
  );
});

test(`Create prefix with custom output folder`, t => {
  const storageManager = createManager(
    'http://www.foo.bar',
    '/tmp/sitespeed.io/foo'
  );
  t.is(storageManager.getStoragePrefix(), 'foo');
});

test(`writeDataForUrl accepts a Readable and streams it to disk`, async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'sitespeed-storage-'));
  try {
    const storageManager = createManager('http://www.foo.bar', dir);
    const payload = 'hello-streaming-world';
    await storageManager.writeDataForUrl(
      Readable.from([payload]),
      'streamed.txt',
      'http://www.foo.bar/page'
    );
    const written = await readFile(
      path.join(dir, 'pages', 'www_foo_bar', 'page', 'data', 'streamed.txt'),
      'utf8'
    );
    t.is(written, payload);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test(`writeDataForUrl still accepts a Buffer/string (backward compat)`, async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'sitespeed-storage-'));
  try {
    const storageManager = createManager('http://www.foo.bar', dir);
    await storageManager.writeDataForUrl(
      'plain text content',
      'plain.txt',
      'http://www.foo.bar/page'
    );
    const written = await readFile(
      path.join(dir, 'pages', 'www_foo_bar', 'page', 'data', 'plain.txt'),
      'utf8'
    );
    t.is(written, 'plain text content');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test(`writeDataForUrl streams gzip pipelines round-trip correctly`, async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'sitespeed-storage-'));
  try {
    const storageManager = createManager('http://www.foo.bar', dir);
    // Build something HAR-shaped that meaningfully exercises the gzip
    // path: large enough that gzip emits multiple data chunks.
    const big = {
      log: {
        entries: Array.from({ length: 5000 }, (_, i) => ({
          i,
          url: 'https://example.com/' + i
        }))
      }
    };
    const json = JSON.stringify(big);
    const { createGzip } = await import('node:zlib');
    const source = Readable.from([json]).pipe(createGzip({ level: 1 }));
    await storageManager.writeDataForUrl(
      source,
      'browsertime.har.gz',
      'http://www.foo.bar/page'
    );

    const gzipped = await readFile(
      path.join(
        dir,
        'pages',
        'www_foo_bar',
        'page',
        'data',
        'browsertime.har.gz'
      )
    );
    const chunks = [];
    const gunzip = createGunzip();
    gunzip.setEncoding('utf8');
    gunzip.on('data', c => chunks.push(c));
    await pipeline(Readable.from([gzipped]), gunzip);
    t.deepEqual(JSON.parse(chunks.join('')), big);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
