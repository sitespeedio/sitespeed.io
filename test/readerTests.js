import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { gzip as _gzip } from 'node:zlib';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';

import test from 'ava';

import { getGzippedFileAsJson } from '../lib/plugins/browsertime/reader.js';

const gzip = promisify(_gzip);

test('getGzippedFileAsJson reads and parses a gzipped JSON file', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'sitespeed-reader-'));
  try {
    const payload = {
      hello: 'world',
      nested: { array: [1, 2, 3], unicode: 'åäö' }
    };
    const gz = await gzip(Buffer.from(JSON.stringify(payload)));
    await writeFile(path.join(dir, 'sample.json.gz'), gz);

    const result = await getGzippedFileAsJson(dir, 'sample.json.gz');
    t.deepEqual(result, payload);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('getGzippedFileAsJson handles payloads larger than a single chunk', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'sitespeed-reader-'));
  try {
    // Build a >1 MB payload so gunzip emits multiple data chunks; this
    // is what guards the streaming join() path.
    const big = Array.from({ length: 20_000 }, (_, i) => ({
      i,
      s: 'x'.repeat(64)
    }));
    const gz = await gzip(Buffer.from(JSON.stringify(big)));
    await writeFile(path.join(dir, 'big.json.gz'), gz);

    const result = await getGzippedFileAsJson(dir, 'big.json.gz');
    t.is(result.length, big.length);
    t.deepEqual(result[0], big[0]);
    t.deepEqual(result.at(-1), big.at(-1));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('getGzippedFileAsJson rejects on a missing file', async t => {
  await t.throwsAsync(() =>
    getGzippedFileAsJson(tmpdir(), 'does-not-exist.json.gz')
  );
});
