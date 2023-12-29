import dayjs from 'dayjs';
import test from 'ava';

import { resultsStorage } from '../lib/core/resultsStorage/index.js';

const timestamp = dayjs();
const timestampString = timestamp.format('YYYY-MM-DD-HH-mm-ss');

function createResultUrls(url, outputFolder, resultBaseURL) {
  return resultsStorage(url, timestamp, { outputFolder, resultBaseURL })
    .resultUrls;
}

test(`Test hasBaseUrl should be false if base url is missing`, t => {
  const resultUrls = createResultUrls('http://www.foo.bar');
  t.is(
    resultUrls.hasBaseUrl(),
    false,
    'hasBaseUrl should be false if base url is missing'
  );
});

test(`Test hasBaseUrl should be true if base url is present`, t => {
  const resultUrls = createResultUrls(
    'http://www.foo.bar',
    undefined,
    'http://results.com'
  );
  t.is(
    resultUrls.hasBaseUrl(),
    true,
    'hasBaseUrl should be true if base url is present'
  );
});

test(`Test reportSummaryUrl should create url with default output folder`, t => {
  const resultUrls = createResultUrls(
    'http://www.foo.bar',
    undefined,
    'http://results.com'
  );
  t.is(
    resultUrls.reportSummaryUrl(),
    `http://results.com/www.foo.bar/${timestampString}`,
    'reportSummaryUrl should create url with default output folder'
  );
});

test(`Test should create url with absolute output folder`, t => {
  const resultUrls = createResultUrls(
    'http://www.foo.bar',
    '/root/leaf',
    'http://results.com'
  );
  t.is(
    resultUrls.reportSummaryUrl(),
    `http://results.com/leaf`,
    'reportSummaryUrl should create url with absolute output folder'
  );
});

test(`Test should create url with relative output folder`, t => {
  const resultUrls = createResultUrls(
    'http://www.foo.bar',
    '../leaf',
    'http://results.com'
  );
  t.is(
    resultUrls.reportSummaryUrl(),
    `http://results.com/leaf`,
    'reportSummaryUrl should create url with relative output folder'
  );
});

test(`Test absoluteSummaryPageUrl should create url with default output folder`, t => {
  const resultUrls = createResultUrls(
    'http://www.foo.bar',
    undefined,
    'http://results.com'
  );
  t.is(
    resultUrls.absoluteSummaryPageUrl('http://www.foo.bar/xyz'),
    `http://results.com/www.foo.bar/${timestampString}/pages/www_foo_bar/xyz/`,
    'should create url with default output folderfolder'
  );
});

test(`Test absoluteSummaryPageUrl should create url with absolute output folder`, t => {
  const resultUrls = createResultUrls(
    'http://www.foo.bar',
    '/root/leaf',
    'http://results.com'
  );
  t.is(
    resultUrls.absoluteSummaryPageUrl('http://www.foo.bar/xyz'),
    `http://results.com/leaf/pages/www_foo_bar/xyz/`,
    'should create url with absolute output folder'
  );
});

test(`Test absoluteSummaryPageUrl should create url with relative output folder`, t => {
  const resultUrls = createResultUrls(
    'http://www.foo.bar',
    '../leaf',
    'http://results.com'
  );
  t.is(
    resultUrls.absoluteSummaryPageUrl('http://www.foo.bar/xyz'),
    `http://results.com/leaf/pages/www_foo_bar/xyz/`,
    'should create url with absolute relative folder'
  );
});

test(`Test relativeSummaryPageUrl should create url with default output folder`, t => {
  const resultUrls = createResultUrls(
    'http://www.foo.bar',
    undefined,
    'http://results.com'
  );
  t.is(
    resultUrls.relativeSummaryPageUrl('http://www.foo.bar/xyz'),
    `pages/www_foo_bar/xyz/`,
    'should create url with default output folder'
  );
});

test(`Test relativeSummaryPageUrl should create url with absolute output folder`, t => {
  const resultUrls = createResultUrls(
    'http://www.foo.bar',
    '/root/leaf',
    'http://results.com'
  );
  t.is(
    resultUrls.relativeSummaryPageUrl('http://www.foo.bar/xyz'),
    `pages/www_foo_bar/xyz/`,
    'should create url with absolute output folder'
  );
});

test(`Test relativeSummaryPageUrl should create url with relative output folder`, t => {
  const resultUrls = createResultUrls(
    'http://www.foo.bar',
    '../leaf',
    'http://results.com'
  );
  t.is(
    resultUrls.relativeSummaryPageUrl('http://www.foo.bar/xyz'),
    `pages/www_foo_bar/xyz/`,
    'should create url with relative output folder'
  );
});
