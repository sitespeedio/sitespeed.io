import test from 'ava';
import { CoachAggregator } from '../lib/plugins/coach/aggregator.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const coachRunPath = resolve(__dirname, 'fixtures', 'coach.run-0.json');
const coachRun = JSON.parse(readFileSync(coachRunPath, 'utf8'));

test(`Should summarize Coach data`, t => {
  const coachAggregator = new CoachAggregator();
  coachAggregator.addToAggregate(coachRun, 'www.sitespeed.io');
  const data = coachAggregator.summarize();
  t.not(data, undefined);
});
