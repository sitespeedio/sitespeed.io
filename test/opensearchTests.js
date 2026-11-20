import test from 'ava';

import { OpenSearchDataGenerator } from '../lib/plugins/opensearch/data-generator.js';
import { OpenSearchSender } from '../lib/plugins/opensearch/sender.js';

test('the PageXray document reads the medians from the statistics', t => {
  const generator = new OpenSearchDataGenerator({ browser: 'chrome' });
  // pagexray.pageSummary is the first run with the statistics for all runs
  const message = {
    type: 'pagexray.pageSummary',
    url: 'https://www.sitespeed.io/',
    group: 'www.sitespeed.io',
    data: {
      transferSize: 1000,
      requests: 10,
      totalDomains: 2,
      statistics: {
        transferSize: { median: 1100, p90: 1200 },
        requests: { median: 11, p90: 12 },
        contentTypes: { javascript: { transferSize: { median: 500 } } },
        thirdParty: { requests: { median: 3 } }
      }
    }
  };
  const document = generator.fromPageXray(message);
  t.deepEqual(document.transferSize, { median: 1100, p90: 1200 });
  t.deepEqual(document.requests, { median: 11, p90: 12 });
  t.deepEqual(document.contentTypes.javascript, {
    transferSize: { median: 500 }
  });
  t.deepEqual(document.thirdParty, { requests: { median: 3 } });
  t.is(document.totalDomains, 2);
});

test('the documents count the long tasks', t => {
  const generator = new OpenSearchDataGenerator({ browser: 'chrome' });
  // browsertime calls the number of long tasks "tasks"
  const pageSummary = generator.fromPageSummary({
    type: 'browsertime.pageSummary',
    url: 'https://www.sitespeed.io/',
    data: {
      statistics: {
        cpu: {
          longTasks: { tasks: { median: 4 }, totalDuration: { median: 300 } }
        }
      }
    }
  });
  t.deepEqual(pageSummary.cpu.longTasksCount, { median: 4 });

  const run = generator.fromRun({
    type: 'browsertime.run',
    url: 'https://www.sitespeed.io/',
    iteration: 1,
    data: { cpu: { longTasks: { tasks: 4, totalDuration: 300 } } }
  });
  t.is(run.cpu.longTasksCount, 4);
});

test('the Coach document keeps the scores of the one Coach run', t => {
  const generator = new OpenSearchDataGenerator({ browser: 'chrome' });
  // coach.pageSummary is the Coach result from the first run
  const document = generator.fromCoach({
    type: 'coach.pageSummary',
    url: 'https://www.sitespeed.io/',
    data: {
      advice: {
        score: 90,
        performance: { score: 85 },
        privacy: { score: 100 },
        bestpractice: { score: 92 },
        info: { domElements: 400 }
      }
    }
  });
  t.deepEqual(document.score, { median: 90 });
  t.deepEqual(document.performance, { median: 85 });
  t.deepEqual(document.info.domElements, { median: 400 });
});

function senderWith(responses) {
  const sender = new OpenSearchSender('localhost');
  sender.calls = [];
  sender.request = async (method, path) => {
    sender.calls.push(`${method} ${path}`);
    return responses[`${method} ${path}`];
  };
  return sender;
}

test('the index template is only written when it is missing or older', async t => {
  const template = { version: 2 };
  const path = '/_index_template/sitespeed-run';
  const stored = version => ({
    [`GET ${path}`]: { index_templates: [{ index_template: { version } }] }
  });

  for (const [responses, written] of [
    [{}, true],
    [stored(), true],
    [stored(1), true],
    [stored(2), false]
  ]) {
    const sender = senderWith(responses);
    t.is(await sender.putIndexTemplate('sitespeed-run', template), written);
    t.is(sender.calls.includes(`PUT ${path}`), written);
  }
});

test('the retention policy is updated and added to old indices when it changed', async t => {
  const path = '/_plugins/_ism/policies/sitespeed-run-retention';
  const stored = ismTemplate => ({
    [`GET ${path}`]: {
      _seq_no: 3,
      _primary_term: 1,
      policy: {
        states: [{ transitions: [{ conditions: { min_index_age: '7d' } }] }],
        ism_template: ismTemplate
      }
    }
  });

  const unchanged = senderWith(
    stored([{ index_patterns: ['sitespeed-run-*'] }])
  );
  t.false(
    await unchanged.putISMPolicy('sitespeed-run-retention', '7d', [
      'sitespeed-run-*'
    ])
  );
  t.deepEqual(unchanged.calls, [`GET ${path}`]);

  // Policies from older versions have no ism_template
  const old = senderWith(stored());
  t.true(
    await old.putISMPolicy('sitespeed-run-retention', '7d', ['sitespeed-run-*'])
  );
  t.deepEqual(old.calls, [
    `GET ${path}`,
    `PUT ${path}?if_seq_no=3&if_primary_term=1`,
    'POST /_plugins/_ism/add/sitespeed-run-*'
  ]);
});
