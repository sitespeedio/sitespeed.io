import test from 'ava';

import { OpenSearchDataGenerator } from '../lib/plugins/opensearch/data-generator.js';

test('the PageXray document reads the medians from the statistics', t => {
  const generator = new OpenSearchDataGenerator({ browser: 'chrome' });
  // pagexray.pageSummary is the first run with the statistics for all runs
  const message = {
    type: 'pagexray.pageSummary',
    url: 'https://www.sitespeed.io/',
    group: 'www.sitespeed.io',
    data: {
      transferSize: 1000,
      requests: 10,
      totalDomains: 2,
      statistics: {
        transferSize: { median: 1100, p90: 1200 },
        requests: { median: 11, p90: 12 },
        contentTypes: { javascript: { transferSize: { median: 500 } } },
        thirdParty: { requests: { median: 3 } }
      }
    }
  };
  const document = generator.fromPageXray(message);
  t.deepEqual(document.transferSize, { median: 1100, p90: 1200 });
  t.deepEqual(document.requests, { median: 11, p90: 12 });
  t.deepEqual(document.contentTypes.javascript, {
    transferSize: { median: 500 }
  });
  t.deepEqual(document.thirdParty, { requests: { median: 3 } });
  t.is(document.totalDomains, 2);
});
