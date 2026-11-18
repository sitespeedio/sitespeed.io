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

const groups = {
  docs: {
    pages: ['docs', 'https://www.sitespeed.io/blog/'],
    timings: { firstPaint: 2500 }
  }
};

test('Use the budget for the group of the alias', t => {
  const result = emptyResult();
  verify(
    message(),
    result,
    { budget: { timings: { firstPaint: 1000 } }, groups },
    'docs'
  );
  t.is(result.working.docs[0].limit, 2500);
});

test('Use the budget for the alias before the budget for its group', t => {
  const result = emptyResult();
  verify(
    message(),
    result,
    {
      budget: { docs: { timings: { firstPaint: 1500 } } },
      groups
    },
    'docs'
  );
  t.is(result.failing.docs[0].limit, 1500);
});

test('Use the generic budget for a page that is in no group', t => {
  const result = emptyResult();
  verify(message(), result, {
    budget: { timings: { firstPaint: 1000 } },
    groups
  });
  t.is(result.failing[url][0].limit, 1000);
});
