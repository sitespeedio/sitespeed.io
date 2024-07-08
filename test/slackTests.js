import path from 'node:path';
import { readFileSync } from 'node:fs';

import test from 'ava';
import intel from 'intel';

import { resultUrls } from '../lib/core/resultsStorage/resultUrls.js';
import { messageMaker } from '../lib/support/messageMaker.js';
import * as filterRegistry from '../lib/support/filterRegistry.js';
import * as statsHelpers from '../lib/support/statsHelpers.js';
import { getSummary } from '../lib/plugins/slack/summary.js';

import { fileURLToPath } from 'node:url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const coachRunPath = path.resolve(__dirname, 'fixtures', 'coach.run-0.json');
const coachRun = JSON.parse(readFileSync(coachRunPath, 'utf8'));

import { DataCollector } from '../lib/plugins/slack/dataCollector.js';

const defaultContextFactory = (context = {}) => {
  return Object.assign(
    {
      messageMaker,
      filterRegistry,
      intel,
      statsHelpers,
      resultUrls: resultUrls('', {})
    },
    context
  );
};

test(`should not hard crash without a name`, t => {
  const dataCollector = new DataCollector(defaultContextFactory());
  const options = {
    browsertime: {
      browser: 'mosaic',
      iterations: 5
    }
  };
  const codeUnderTest = () =>
    getSummary(dataCollector, [], resultUrls(), undefined, options);

  const summary = codeUnderTest();
  t.not(summary.summaryText, undefined);
});

test(`DataCollector add data should add new page URL `, t => {
  const context = defaultContextFactory();
  const collector = new DataCollector(context);

  collector.addDataForUrl('https://fake-site.sitespeed.io', 'coach.run', {
    coach: { pageSummary: coachRun }
  });

  t.deepEqual(collector.getURLs(), ['https://fake-site.sitespeed.io']);
});
