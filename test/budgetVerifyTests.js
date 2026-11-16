import test from 'ava';

import { verify } from '../lib/plugins/budget/verify.js';

const url = 'https://www.sitespeed.io/documentation/';

function message() {
  return {
    type: 'browsertime.pageSummary',
    url,
    data: { statistics: { timings: { firstPaint: { median: 2000 } } } }
  };
}

function emptyResult() {
  return { working: {}, failing: {}, error: {} };
}

test('Use the budget for a URL with dots in it', t => {
  const result = emptyResult();
  verify(message(), result, {
    budget: {
      [url]: { timings: { firstPaint: 3000 } },
      timings: { firstPaint: 1000 }
    }
  });
  t.is(result.failing[url], undefined);
  t.is(result.working[url][0].limit, 3000);
});

test('Use the budget for an alias with dots in it', t => {
  const result = emptyResult();
  verify(
    message(),
    result,
    {
      budget: {
        'docs.start': { timings: { firstPaint: 3000 } },
        timings: { firstPaint: 1000 }
      }
    },
    'docs.start'
  );
  t.is(result.working['docs.start'][0].limit, 3000);
});

test('Use the generic budget when there is no budget for the URL', t => {
  const result = emptyResult();
  verify(message(), result, { budget: { timings: { firstPaint: 1000 } } });
  t.is(result.failing[url][0].limit, 1000);
});
