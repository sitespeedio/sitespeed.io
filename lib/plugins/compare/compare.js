import { getLogger } from '@sitespeed.io/log';
import timestamp from '../../support/time.js';

import {
  getStatistics,
  runStatisticalTests,
  getMetrics,
  cliffsDelta,
  hodgesLehmann,
  getIsSignificant
} from './helper.js';

const log = getLogger('sitespeedio.plugin.compare');
const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * Compare two tests of the same page. Each test is { browsertime, pagexray },
 * the same shape as a saved baseline. Returns the data of the
 * compare.pageSummary message: { metrics, meta, raw }.
 */
export async function compareTests(
  baseline,
  current,
  compareOptions,
  url,
  iterations
) {
  const newMetrics = getMetrics(current.browsertime);
  const baselineMetrics = getMetrics(baseline.browsertime);
  const metricsInputData = {
    options: {
      test_type: compareOptions.testType,
      alternative: compareOptions.alternative
    },
    metrics: {}
  };

  if (compareOptions.testType === 'mannwhitneyu') {
    metricsInputData.options.use_continuity =
      compareOptions.mannwhitneyu.useContinuity;
    metricsInputData.options.method = compareOptions.mannwhitneyu.method;
    metricsInputData.options.nan_policy = 'omit';
  } else if (compareOptions.testType === 'wilcoxon') {
    metricsInputData.options.correction = compareOptions.wilcoxon.correction;
    metricsInputData.options.zero_method = compareOptions.wilcoxon.zeroMethod;
  }

  for (let group in newMetrics) {
    if (baselineMetrics[group]) {
      metricsInputData.metrics[group] = {};
      for (let metricName in newMetrics[group]) {
        // Ensure both current and baseline metrics are available
        if (
          baselineMetrics[group][metricName] &&
          newMetrics[group][metricName]
        ) {
          // Directly access the Metric instance
          const currentMetric = newMetrics[group][metricName];
          const baselineMetric = baselineMetrics[group][metricName];

          // Ensure these are indeed Metric instances
          const currentStats = getStatistics(currentMetric.getValues());
          const baselineStats = getStatistics(baselineMetric.getValues());
          metricsInputData.metrics[group][metricName] = {
            baseline: baselineStats.data,
            current: currentStats.data
          };
        } else {
          log.info(
            `Skipping ${group}.${metricName} as it's not present in both current and baseline metrics.`
          );
        }
      }
    }
  }

  const results = await runStatisticalTests(metricsInputData);
  const finalResult = {};
  for (let group in results) {
    finalResult[group] = {};
    for (let metricName in results[group]) {
      const result = results[group][metricName];
      // Again, accessing the metricName within the group
      const currentStats = getStatistics(
        newMetrics[group][metricName].getValues()
      );
      const baselineStats = getStatistics(
        baselineMetrics[group][metricName].getValues()
      );

      const cliffs = cliffsDelta(currentStats.data, baselineStats.data);
      finalResult[group][metricName] = {
        current: {
          stdev: currentStats.stddev(),
          mean: currentStats.amean(),
          median: currentStats.median(),
          values: currentStats.data
        },
        baseline: {
          stdev: baselineStats.stddev(),
          mean: baselineStats.amean(),
          median: baselineStats.median(),
          values: baselineStats.data
        },
        statisticalTestU: result['p-value'],
        statisticalTestKS: result['ks-p-value'],
        cliffsDelta: cliffs,
        shift: hodgesLehmann(currentStats.data, baselineStats.data),
        isSignificant: getIsSignificant(result['p-value'], cliffs)
      };
    }
  }

  const meta = {
    baseline: {
      timestamp: timestamp(baseline.browsertime.info.timestamp).format(
        TIME_FORMAT
      ),
      url: baseline.browsertime.info.url,
      alias: baseline.browsertime.info.alias
    },
    current: {
      timestamp: timestamp(current.browsertime.info.timestamp).format(
        TIME_FORMAT
      ),
      url: url,
      alias: current.browsertime.info.alias
    },
    testOptions: compareOptions,
    iterations: iterations
  };

  const raw = {
    baseline: {
      pagexray: baseline.pagexray,
      browsertime: baseline.browsertime
    },
    current: {
      pagexray: current.pagexray,
      browsertime: current.browsertime
    }
  };
  return { metrics: finalResult, meta, raw };
}
