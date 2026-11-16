import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import test from 'ava';

import { DomainsAggregator } from '../lib/plugins/domains/aggregator.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const har = JSON.parse(
  readFileSync(
    path.resolve(__dirname, 'fixtures', 'www-theverge-com.har'),
    'utf8'
  )
);

test(`Should summarize data per domain`, t => {
  const aggregator = new DomainsAggregator();
  aggregator.addToAggregate(har, 'http://www.vox.com');
  const summary = aggregator.summarize();
  const voxDomain = summary.groups.total['cdn1.vox-cdn.com'];
  t.is(voxDomain.connect.max, 11);
});
