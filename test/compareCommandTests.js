import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile as _execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import test from 'ava';

const execFile = promisify(_execFile);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const data = path.join(__dirname, 'data', 'compare');

function runCompare(arguments_) {
  return execFile(
    'node',
    [path.join(__dirname, '..', 'bin', 'compare.js'), ...arguments_],
    { env: { ...process.env, PYTHON: path.join(data, 'fakePython.mjs') } }
  );
}

test('Compare two saved tests without running a test', async t => {
  const outputFolder = mkdtempSync(path.join(tmpdir(), 'compare-'));
  await runCompare([
    path.join(data, 'fast.json'),
    path.join(data, 'slow.json'),
    '--outputFolder',
    outputFolder
  ]);

  const result = JSON.parse(
    readFileSync(path.join(outputFolder, 'compare.json'), 'utf8')
  );
  t.is(result.meta.iterations, 7);
  t.is(result.meta.testOptions.testType, 'mannwhitneyu');
  t.is(result.metrics.timings.firstContentfulPaint.current.median, 270);
  t.is(result.metrics.timings.firstContentfulPaint.baseline.median, 434);

  const html = readFileSync(path.join(outputFolder, 'index.html'), 'utf8');
  t.regex(html, /<title>Compare https:\/\/www\.sitespeed\.io\/<\/title>/);
  t.regex(html, /id="chart-timings_firstContentfulPaint"/);
});

test('Fail on a file that is not a saved test', async t => {
  const error = await t.throwsAsync(
    runCompare([
      path.join(data, 'fast.json'),
      path.join(__dirname, 'budget.json')
    ])
  );
  t.is(error.code, 1);
  t.regex(error.stderr + error.stdout, /is not a saved test/);
});
