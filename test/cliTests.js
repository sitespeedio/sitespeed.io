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
