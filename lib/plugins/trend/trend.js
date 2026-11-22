import { getStatistics } from '../compare/helper.js';

// The last 4 tests (about a day at 4 tests a day) against the 28 before
// (about a week). Single runs of one test share the network and the
// server, so on live data the test median is the unit that is compared.
export const CURRENT_TESTS = 4;
export const BASELINE_TESTS = 28;
export const P_VALUE = 0.01;

export function addTest(history, timestamp, values) {
  const tests = [...history.tests, { timestamp, values }];
  return { tests: tests.slice(-(BASELINE_TESTS + CURRENT_TESTS)) };
}

/**
 * Split the history of one metric into the baseline and the current
 * window. Returns undefined until there are enough tests.
 */
export function getWindows(history, metric) {
  const values = history.tests
    .map(test => test.values[metric])
    .filter(value => value !== undefined);
  if (values.length < BASELINE_TESTS + CURRENT_TESTS) {
    return;
  }
  const last = values.slice(-(BASELINE_TESTS + CURRENT_TESTS));
  return {
    baseline: last.slice(0, BASELINE_TESTS),
    current: last.slice(BASELINE_TESTS)
  };
}

/**
 * A metric is slower when the rank test is clear AND the change is big
 * enough to matter. Without the minimum change, tiny but real changes
 * (a few ms in a replay setup) would alert all the time.
 */
export function getVerdict(
  baseline,
  current,
  pValue,
  minChangePercent,
  minChangeValue
) {
  const baselineMedian = getStatistics(baseline).median();
  const currentMedian = getStatistics(current).median();
  const change = currentMedian - baselineMedian;
  const isSlower =
    pValue < P_VALUE &&
    change >=
      Math.max((baselineMedian * minChangePercent) / 100, minChangeValue);
  return {
    isSlower: isSlower ? 1 : 0,
    change: baselineMedian > 0 ? (change / baselineMedian) * 100 : 0,
    pValue,
    baselineMedian,
    currentMedian
  };
}
