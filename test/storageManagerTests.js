'use strict';

const resultsStorage = require('../lib/core/resultsStorage');
const dayjs = require('dayjs');
const path = require('path');
const test = require('ava');

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
