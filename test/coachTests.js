'use strict';

const test = require('ava');
const aggregator = require('../lib/plugins/coach/aggregator');
const fs = require('fs');
const path = require('path');

const coachRunPath = path.resolve(__dirname, 'fixtures', 'coach.run-0.json');
const coachRun = JSON.parse(fs.readFileSync(coachRunPath, 'utf8'));

test(`Should summarize Coach data`, t => {
  aggregator.addToAggregate(coachRun, 'www.sitespeed.io');
  const data = aggregator.summarize();
  t.not(data, undefined);
});
