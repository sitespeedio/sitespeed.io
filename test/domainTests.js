'use strict';

const test = require('ava');
const aggregator = require('../lib/plugins/domains/aggregator');
const fs = require('fs');
const path = require('path');

const har = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, 'fixtures', 'www-theverge-com.har'),
    'utf8'
  )
);

test(`Should summarize data per domain`, t => {
  aggregator.addToAggregate(har, 'http://www.vox.com');
  const summary = aggregator.summarize();
  const voxDomain = summary.groups.total['cdn1.vox-cdn.com'];
  t.is(voxDomain.connect.max, 11);
});
