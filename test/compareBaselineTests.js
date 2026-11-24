import test from 'ava';

import {
  shouldSaveBaseline,
  toWeekdays
} from '../lib/plugins/compare/index.js';

const day = 24 * 60 * 60 * 1000;
// Noon local time on a Tuesday, so the weekday is the same in every time zone
const now = new Date(2026, 10, 24, 12).getTime();
const baselineFrom = daysAgo => ({
  browsertime: {
    info: { timestamp: new Date(now - daysAgo * day).toISOString() }
  }
});

test('Without the options the baseline is never saved', t => {
  t.false(shouldSaveBaseline({}, baselineFrom(30), now));
  t.false(shouldSaveBaseline({}, undefined, now));
});

test('saveBaseline always saves', t => {
  t.true(shouldSaveBaseline({ saveBaseline: true }, baselineFrom(1), now));
});

test('baselineMaxAge saves when the baseline is missing or too old', t => {
  const options = { baselineMaxAge: 7 };
  t.true(shouldSaveBaseline(options, undefined, now));
  t.false(shouldSaveBaseline(options, baselineFrom(6.9), now));
  t.true(shouldSaveBaseline(options, baselineFrom(7.1), now));
});

test('baselineMaxAge saves when the baseline has no valid time', t => {
  t.true(
    shouldSaveBaseline(
      { baselineMaxAge: 7 },
      { browsertime: { info: {} } },
      now
    )
  );
});

test('baselineDays only renews the baseline on those days', t => {
  const options = { baselineMaxAge: 6, baselineDays: 'saturday,sunday' };
  const saturday = now + 4 * day;
  t.false(shouldSaveBaseline(options, baselineFrom(10), now));
  t.true(shouldSaveBaseline(options, baselineFrom(10), saturday));
  // From Monday, so 5 days old on Saturday
  t.false(shouldSaveBaseline(options, baselineFrom(1), saturday));
  t.true(shouldSaveBaseline(options, undefined, now));
});

test('baselineDays accepts a list and any case', t => {
  t.deepEqual(toWeekdays('Saturday, sunday'), ['saturday', 'sunday']);
  t.deepEqual(toWeekdays(['saturday', 'sunday']), ['saturday', 'sunday']);
  t.deepEqual(toWeekdays(), []);
});
