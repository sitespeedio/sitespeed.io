import test from 'ava';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile as _execFile } from 'node:child_process';
const execFile = promisify(_execFile);

import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function runSitespeed(options = []) {
  const cli = path.join(path.resolve(__dirname), '../bin/sitespeed.js');
  return execFile('node', [cli].concat(options));
}

test(`Test cli without any arguments`, async t => {
  let stderr;
  let exitCode = 0;
  try {
    await runSitespeed();
  } catch (error) {
    stderr = error.stderr;
    exitCode = error.code;
  }
  t.not(stderr, undefined, 'Should output in standard error');
  t.not(exitCode, 0, 'Should exit with error code');
  t.true(stderr.includes('sitespeed.js [options] <url>/<file>'));
});

test(`CLI should support --help`, async t => {
  const run = await runSitespeed(['--help']);
  t.not(run.stdout, undefined, 'Should output in standard output');
  t.true(
    run.stdout.includes('--browsertime'),
    'Should include Browsertime help'
  );
});

test(`CLI should silently ignore the removed summary boxes options`, async t => {
  let stderr = '';
  try {
    await runSitespeed([
      '--html.summaryBoxes',
      'foo.bar',
      '--html.summaryBoxesThresholds',
      'limits.json'
    ]);
  } catch (error) {
    stderr = error.stderr;
  }
  t.true(
    stderr.includes('You need to supply one/multiple URLs or scripts'),
    'Should fail on the missing URL, not on the removed options'
  );
  t.false(
    stderr.includes('summary box'),
    'Should not validate the removed summary boxes options'
  );
});
