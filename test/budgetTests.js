import test from 'ava';

import { verify } from '../lib/plugins/budget/verify.js';

function pagexrayMessage() {
  return {
    type: 'pagexray.pageSummary',
    url: 'https://www.sitespeed.io/',
    data: { statistics: { requests: { median: 120 } } }
  };
}

test('An unknown budget metric is skipped, not a crash', t => {
  const result = { working: {}, failing: {}, error: {} };
  const budgets = { budget: { requests: { total: 100, javascriptt: 10 } } };

  t.notThrows(() => verify(pagexrayMessage(), result, budgets));

  // The correctly configured metric is still checked
  const failing = result.failing['https://www.sitespeed.io/'];
  t.is(failing.length, 1);
  t.is(failing[0].type, 'requests');
  t.is(failing[0].value, 120);
  t.is(failing[0].limit, 100);
});

test('A known budget metric under the limit is working', t => {
  const result = { working: {}, failing: {}, error: {} };
  const budgets = { budget: { requests: { total: 200 } } };

  verify(pagexrayMessage(), result, budgets);

  t.is(result.working['https://www.sitespeed.io/'].length, 1);
  t.is(result.failing['https://www.sitespeed.io/'], undefined);
});
