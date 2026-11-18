import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import test from 'ava';

import { writeJunit } from '../lib/plugins/budget/junit.js';
import { writeTap } from '../lib/plugins/budget/tap.js';

const url = 'https://www.sitespeed.io/';

function noDataResult() {
  return {
    working: {},
    failing: {},
    error: { [url]: 'BrowserError Could not start chrome with 3 tries' }
  };
}

test('JUnit reports a URL that could not be tested as an error', t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'budget-'));
  writeJunit(noDataResult(), dir, { budget: {} });
  const xml = readFileSync(path.join(dir, 'junit.xml'), 'utf8');

  t.regex(xml, /<testsuites tests="1" failures="0" errors="1"/);
  t.regex(
    xml,
    /<error message="BrowserError Could not start chrome with 3 tries"\/>/
  );
});

test('TAP reports a URL that could not be tested as not ok', t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'budget-'));
  writeTap(noDataResult(), dir);
  const tap = readFileSync(path.join(dir, 'budget.tap'), 'utf8');

  t.regex(
    tap,
    /^not ok 1 error https:\/\/www\.sitespeed\.io\/ BrowserError Could not start chrome with 3 tries$/m
  );
  t.regex(tap, /^1\.\.1$/m);
  t.notRegex(tap, /^ok /m);
});
