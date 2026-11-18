#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { compileFile } from 'pug';
import { getLogger } from '@sitespeed.io/log';

import { configure } from '../lib/core/logging.js';
import { addOptions } from '../lib/cli/options/compare.js';
import { compareTests } from '../lib/plugins/compare/compare.js';
import * as helpers from '../lib/support/helpers/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const log = getLogger('sitespeedio.compare');

const parser = yargs(hideBin(process.argv))
  .parserConfiguration({
    'camel-case-expansion': false,
    'deep-merge-config': true
  })
  .usage(
    '$0 [options] <baseline.json> <current.json>\n\nCompare two tests that you saved with --compare.saveBaseline, without running a new test.'
  )
  .option('outputFolder', {
    describe: 'The folder where the compare HTML and JSON are stored.',
    default: 'compare-result',
    type: 'string'
  })
  .option('verbose', {
    alias: 'v',
    describe: 'Log more. Pass it more than once to log even more.',
    type: 'count'
  })
  .demandCommand(2, 2, 'You need to give a baseline file and a current file.')
  .help()
  .alias('help', 'h');
addOptions(parser);
const options = await parser.parseAsync();

configure({ verbose: options.verbose });

function readTest(file) {
  const test = JSON.parse(readFileSync(path.resolve(file), 'utf8'));
  if (!test.browsertime || !test.pagexray) {
    throw new Error(
      `${file} is not a saved test. Save tests with --compare.saveBaseline.`
    );
  }
  return test;
}

try {
  const [baselineFile, currentFile] = options._;
  const baseline = readTest(baselineFile);
  const current = readTest(currentFile);

  const iterations = current.browsertime.timestamps.length;
  if (baseline.browsertime.timestamps.length !== iterations) {
    log.warning(
      'The baseline test has %s runs and the current test has %s. You should compare tests with the same number of runs.',
      baseline.browsertime.timestamps.length,
      iterations
    );
  }

  const result = await compareTests(
    baseline,
    current,
    options.compare,
    current.browsertime.info.url,
    iterations
  );

  if (Object.keys(result.metrics).length === 0) {
    throw new Error(
      'No metrics could be compared. Check that Python 3 with scipy is installed (or set PYTHON to it) and look at the log above.'
    );
  }

  // The page has the report CSS in it, so it works without other files
  const css = readFileSync(
    path.resolve(
      __dirname,
      '..',
      'lib',
      'plugins',
      'html',
      'assets',
      'css',
      'index-light.min.css'
    ),
    'utf8'
  );
  const html = compileFile(
    path.resolve(
      __dirname,
      '..',
      'lib',
      'plugins',
      'compare',
      'pug',
      'standalone.pug'
    )
  )({
    pageInfo: { data: { compare: { pageSummary: result } } },
    h: helpers,
    css,
    title: `Compare ${result.meta.current.alias || result.meta.current.url}`
  });

  const outputFolder = path.resolve(options.outputFolder);
  mkdirSync(outputFolder, { recursive: true });
  writeFileSync(path.join(outputFolder, 'index.html'), html);
  writeFileSync(
    path.join(outputFolder, 'compare.json'),
    JSON.stringify({ metrics: result.metrics, meta: result.meta })
  );
  log.info('Stored the compare result in %s', outputFolder);
} catch (error) {
  log.error(error.message);
  process.exitCode = 1;
}
