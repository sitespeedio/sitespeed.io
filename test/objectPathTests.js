import test from 'ava';

import { get, set } from '../lib/support/objectPath.js';
import friendlyNames from '../lib/support/friendlynames.js';

const data = {
  timings: {
    paintTiming: { 'first-contentful-paint': 1350, 'first-paint': 1300 },
    'with.dot': 7
  },
  list: [{ name: 'first' }, { name: 'second' }]
};

test(`get reads dot paths`, t => {
  t.is(get(data, 'timings.paintTiming.first-contentful-paint'), 1350);
  t.is(get(data, 'list.1.name'), 'second');
});

test(`get reads bracket paths with single and double quotes`, t => {
  t.is(get(data, "timings.paintTiming['first-contentful-paint']"), 1350);
  t.is(get(data, 'timings.paintTiming["first-paint"]'), 1300);
});

test(`get reads keys with a dot inside brackets`, t => {
  t.is(get(data, "timings['with.dot']"), 7);
});

test(`get reads array indexes in brackets`, t => {
  t.is(get(data, 'list[0].name'), 'first');
});

test(`get returns the default value for a missing bracket path`, t => {
  t.is(get(data, "timings.paintTiming['missing']", 'none'), 'none');
});

test(`set writes bracket paths`, t => {
  const target = {};
  set(target, "timings.paintTiming['first-contentful-paint']", 99);
  set(target, 'list[0].name', 'first');
  t.deepEqual(target, {
    timings: { paintTiming: { 'first-contentful-paint': 99 } },
    list: [{ name: 'first' }]
  });
});

test(`the First Contentful Paint paths in friendlynames resolve`, t => {
  const pageSummary = {
    statistics: {
      timings: { paintTiming: { 'first-contentful-paint': { median: 1350 } } }
    }
  };
  for (const group of ['googleWebVitals', 'timings']) {
    const fcp = friendlyNames.browsertime[group].firstContentfulPaint;
    t.is(get(pageSummary, fcp.path), 1350, group + ' path');
    t.is(get(data, fcp.runPath), 1350, group + ' runPath');
  }
});
