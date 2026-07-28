// The Hodges-Lehmann shift estimate is the number the compare HTML leans on
// to say "how big is the change" (the p-value only says how consistent it
// is), so its median-of-pairwise-differences and order-statistic CI bounds
// are pinned here against hand-computed values.

import test from 'ava';

import { cliffsDelta, hodgesLehmann } from '../lib/plugins/compare/helper.js';

test('cliffsDelta is 0 for identical samples', t => {
  t.is(cliffsDelta([1, 2, 3], [1, 2, 3]), 0);
});

test('cliffsDelta is +/-1 for completely separated samples', t => {
  t.is(cliffsDelta([10, 11, 12], [1, 2, 3]), 1);
  t.is(cliffsDelta([1, 2, 3], [10, 11, 12]), -1);
});

test('hodgesLehmann estimate is the median of all pairwise differences', t => {
  // Pairwise current - baseline: [7, 8, 9, 17, 18, 19, 27, 28, 29].
  const shift = hodgesLehmann([10, 20, 30], [1, 2, 3]);
  t.is(shift.estimate, 18);
  // At n = m = 3 the rank offset clamps to 1, so the CI spans the full
  // range of pairwise differences.
  t.is(shift.lower, 7);
  t.is(shift.upper, 29);
  t.is(shift.confidence, 0.95);
});

test('hodgesLehmann on a clean constant shift collapses to the shift', t => {
  const baseline = Array.from({ length: 21 }).fill(303);
  const current = Array.from({ length: 21 }).fill(310);
  const shift = hodgesLehmann(current, baseline);
  t.is(shift.estimate, 7);
  t.is(shift.lower, 7);
  t.is(shift.upper, 7);
});

test('hodgesLehmann CI covers zero when nothing changed', t => {
  const baseline = [100, 102, 98, 101, 99, 103, 100, 97, 104, 100];
  const shift = hodgesLehmann(baseline, baseline);
  t.is(shift.estimate, 0);
  t.true(shift.lower <= 0);
  t.true(shift.upper >= 0);
});

test('hodgesLehmann averages the two middle differences on even counts', t => {
  // Pairwise differences: [4, 6, 14, 16] — estimate is (6 + 14) / 2.
  const shift = hodgesLehmann([10, 20], [4, 6]);
  t.is(shift.estimate, 10);
});

test('hodgesLehmann returns undefined for empty samples', t => {
  t.is(hodgesLehmann([], [1, 2]), undefined);
});
