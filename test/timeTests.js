// Verifies the local time helper matches the subset of dayjs we used to depend
// on. Expected outputs were captured side-by-side against dayjs 1.11.18 + the
// utc plugin before the swap, so a regression here means we drifted from the
// dayjs format() / valueOf() semantics the rest of the codebase expects.

import test from 'ava';

import timestamp from '../lib/support/time.js';

// 2026-01-17T04:00:00.123Z — a fixed UTC instant. We use a UTC instant so the
// local-time output below depends on the host's timezone; the UTC outputs do
// not.
const FIXED_MS = 1_768_622_400_123;

const pad = n => String(n).padStart(2, '0');

function describeLocalOffset() {
  // Pick a date in the middle of January to avoid DST surprises.
  const offsetMin = -new Date(FIXED_MS).getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  return `${sign}${pad(Math.trunc(abs / 60))}:${pad(abs % 60)}`;
}
const LOCAL_OFFSET = describeLocalOffset();

function partsLocal() {
  const d = new Date(FIXED_MS);
  return {
    Y: String(d.getFullYear()),
    M: pad(d.getMonth() + 1),
    D: pad(d.getDate()),
    h: pad(d.getHours()),
    m: pad(d.getMinutes()),
    s: pad(d.getSeconds())
  };
}

test('utc fixed instant — YYYY-MM-DD HH:mm:ss', t => {
  t.is(
    timestamp.utc(FIXED_MS).format('YYYY-MM-DD HH:mm:ss'),
    '2026-01-17 04:00:00'
  );
});

test('utc fixed instant — YYYY-MM-DD-HH-mm-ss', t => {
  t.is(
    timestamp.utc(FIXED_MS).format('YYYY-MM-DD-HH-mm-ss'),
    '2026-01-17-04-00-00'
  );
});

test('utc fixed instant — YYYY-MM-DD HH:mm:ss Z (Z token expands to offset)', t => {
  t.is(
    timestamp.utc(FIXED_MS).format('YYYY-MM-DD HH:mm:ss Z'),
    '2026-01-17 04:00:00 +00:00'
  );
});

test('utc fixed instant — default (no-arg) format ends with literal Z', t => {
  t.is(timestamp.utc(FIXED_MS).format(), '2026-01-17T04:00:00Z');
});

test('utc fixed instant — explicit ISO pattern uses +00:00 (not Z)', t => {
  t.is(
    timestamp.utc(FIXED_MS).format('YYYY-MM-DDTHH:mm:ssZ'),
    '2026-01-17T04:00:00+00:00'
  );
});

test('local fixed instant — YYYY-MM-DD HH:mm:ss uses local clock', t => {
  const p = partsLocal();
  t.is(
    timestamp(FIXED_MS).format('YYYY-MM-DD HH:mm:ss'),
    `${p.Y}-${p.M}-${p.D} ${p.h}:${p.m}:${p.s}`
  );
});

test('local fixed instant — default (no-arg) format includes local offset', t => {
  const p = partsLocal();
  t.is(
    timestamp(FIXED_MS).format(),
    `${p.Y}-${p.M}-${p.D}T${p.h}:${p.m}:${p.s}${LOCAL_OFFSET}`
  );
});

test('valueOf returns ms timestamp (works in arithmetic)', t => {
  t.is(timestamp(FIXED_MS).valueOf(), FIXED_MS);
  t.is(timestamp.utc(FIXED_MS).valueOf(), FIXED_MS);
  // Implicit coercion (matches how the graphite/grafana code path divides by 1000).
  t.is(Math.round(timestamp(FIXED_MS) / 1000), Math.round(FIXED_MS / 1000));
});

test('parses ISO strings', t => {
  t.is(
    timestamp.utc('2026-07-04T12:34:56Z').format('YYYY-MM-DD HH:mm:ss'),
    '2026-07-04 12:34:56'
  );
});

test('no-arg constructor returns the current instant', t => {
  const before = Date.now();
  const ms = timestamp().valueOf();
  const after = Date.now();
  t.true(ms >= before && ms <= after);
});
