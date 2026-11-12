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

test(`CLI should reject an unknown connectivity engine`, async t => {
  let stderr = '';
  let exitCode = 0;
  try {
    await runSitespeed([
      '--browsertime.connectivity.engine',
      'tc',
      'https://www.sitespeed.io'
    ]);
  } catch (error) {
    stderr = error.stderr;
    exitCode = error.code;
  }
  t.not(exitCode, 0, 'Should exit with error code');
  t.true(stderr.includes('Unknown connectivity engine "tc"'));
});

test(`CLI should reject debug mode on Android`, async t => {
  let stderr = '';
  try {
    await runSitespeed(['--debug', '--android', 'https://www.sitespeed.io']);
  } catch (error) {
    stderr = error.stderr;
  }
  t.true(stderr.includes('Debug mode do not work on Android'));
});

test(`CLI should reject Samsung Internet without Android`, async t => {
  let stderr = '';
  try {
    await runSitespeed(['-b', 'samsung', 'https://www.sitespeed.io']);
  } catch (error) {
    stderr = error.stderr;
  }
  t.true(stderr.includes('Samsung Internet only works on Android'));
});

test.serial(
  `CLI should run Samsung Internet on Android with the Chrome code`,
  async t => {
    const argv = process.argv;
    process.argv = [
      'node',
      'sitespeed.js',
      '--android',
      '-b',
      'samsung',
      'https://www.sitespeed.io'
    ];
    try {
      const { parseCommandLine } = await import('../lib/cli/cli.js');
      const { options } = await parseCommandLine();
      t.is(options.browsertime.browser, 'chrome');
      t.is(
        options.browsertime.chrome.android.package,
        'com.sec.android.app.sbrowser'
      );
    } finally {
      process.argv = argv;
    }
  }
);

test.serial(
  `CLI should accept debug mode on desktop and raise the timeouts`,
  async t => {
    const argv = process.argv;
    process.argv = [
      'node',
      'sitespeed.js',
      '--debug',
      'https://www.sitespeed.io'
    ];
    try {
      const { parseCommandLine } = await import('../lib/cli/cli.js');
      const { options } = await parseCommandLine();
      t.is(options.browsertime.timeouts.pageLoad, 2_147_483_647);
      t.is(options.browsertime.timeouts.script, 2_147_483_647);
      t.is(options.browsertime.timeouts.pageCompleteCheck, 2_147_483_647);
    } finally {
      process.argv = argv;
    }
  }
);
