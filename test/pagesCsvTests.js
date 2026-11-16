import test from 'ava';

import { pagesToCsv } from '../lib/plugins/html/pagesCsv.js';
import friendlyNames from '../lib/support/friendlynames.js';

const pages = {
  'https://www.sitespeed.io/': {
    data: {
      browsertime: {
        pageSummary: {
          info: { alias: 'start, page' },
          statistics: {
            timings: {
              largestContentfulPaint: { renderTime: { median: 444 } },
              paintTiming: { 'first-contentful-paint': { median: 402 } }
            }
          }
        }
      },
      pagexray: {
        pageSummary: { statistics: { transferSize: { median: 61_234 } } }
      },
      coach: { pageSummary: { advice: { performance: { score: 100 } } } }
    }
  },
  'https://www.sitespeed.io/documentation/': {
    data: {
      browsertime: {
        pageSummary: {
          statistics: {
            timings: { largestContentfulPaint: { renderTime: { median: 512 } } }
          }
        }
      }
    }
  }
};

const metrics = [
  'googleWebVitals.largestContentfulPaint',
  'googleWebVitals.firstContentfulPaint',
  'transferSize.total',
  'score.performance',
  'not.aMetric'
];

test('One row per page with the configured metrics as raw values', t => {
  const lines = pagesToCsv(pages, metrics, friendlyNames).trimEnd().split('\n');

  t.is(
    lines[0],
    'URL,Alias,Largest Contentful Paint (ms),First Contentful Paint (ms),Total Transfer Size (bytes),Coach Performance Score'
  );
  t.is(lines[1], 'https://www.sitespeed.io/,"start, page",444,402,61234,100');
  t.is(lines[2], 'https://www.sitespeed.io/documentation/,,512,,,');
});

test('Use the alias from the URL file when browsertime has none', t => {
  const csv = pagesToCsv(pages, metrics, friendlyNames, {
    'https://www.sitespeed.io/documentation/': { urlAlias: 'docs' }
  });
  t.true(csv.includes('https://www.sitespeed.io/documentation/,docs,512'));
});
