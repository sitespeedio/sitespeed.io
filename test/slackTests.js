'use strict';
const path = require('path');
const fs = require('fs');
const test = require('ava');

const resultUrls = require('../lib/core/resultsStorage/resultUrls');
const messageMaker = require('../lib/support/messageMaker');
const filterRegistry = require('../lib/support/filterRegistry');
const intel = require('intel');
const statsHelpers = require('../lib/support/statsHelpers');

const coachRunPath = path.resolve(__dirname, 'fixtures', 'coach.run-0.json');
const coachRun = JSON.parse(fs.readFileSync(coachRunPath, 'utf8'));

const DataCollector = require('../lib/plugins/slack/dataCollector');

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
  const getSummary = require('../lib/plugins/slack/summary');
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

  collector.addDataForUrl(
    'https://fake-site.sitespeed.io',
    'coach.run',
    { coach: { pageSummary: coachRun } },
    undefined
  );

  t.deepEqual(collector.getURLs(), ['https://fake-site.sitespeed.io']);
});
