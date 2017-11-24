const get = require('lodash.get');

module.exports = {
  pickMedianRun(runs, pageInfo) {
    // Choose the median run. Early first version, in the future we can make
    // this configurable through the CLI
    // If we have SpeedIndex use that else backup with RUM SpeedIndex

    const speedIndexMedian = get(
      pageInfo,
      'data.browsertime.pageSummary.statistics.visualMetrics.SpeedIndex.median'
    );
    const rumSpeedIndexMedian = get(
      pageInfo,
      'data.browsertime.pageSummary.statistics.timings.rumSpeedIndex.median'
    );
    if (speedIndexMedian) {
      for (var run of runs) {
        if (
          speedIndexMedian === run.data.browsertime.run.visualMetrics.SpeedIndex
        ) {
          return {
            name: 'SpeedIndex',
            runIndex: run.runIndex
          };
        }
      }
    } else if (rumSpeedIndexMedian) {
      for (var rumRuns of runs) {
        // make sure we run Browsertime for that run = 3 runs WPT and 2 runs BT
        if (
          rumRuns.data.browsertime &&
          rumSpeedIndexMedian ===
            rumRuns.data.browsertime.run.timings.rumSpeedIndex
        ) {
          return {
            name: 'RUMSpeedIndex',
            runIndex: rumRuns.runIndex
          };
        }
      }
    }
    return {
      name: '',
      runIndex: 0,
      default: true
    };
  },
  // Get metrics from a run as a String to use in description
  getMetricsFromRun(pageInfo) {
    const visualMetrics = get(pageInfo, 'data.browsertime.run.visualMetrics');
    const timings = get(pageInfo, 'data.browsertime.run.timings');
    if (visualMetrics) {
      return `First Visual Change: ${visualMetrics.FirstVisualChange},
       Speed Index: ${visualMetrics.SpeedIndex},
       Visual Complete 85%: ${visualMetrics.VisualComplete85},
       Last Visual Change: ${visualMetrics.LastVisualChange}`;
    } else if (timings) {
      return `RUMSpeedIndex: ${timings.rumSpeedIndex}, Fully loaded: ${
        timings.fullyLoaded
      }`;
    } else {
      return '';
    }
  },
  getMetricsFromPageSummary(pageInfo) {
    const visualMetrics = get(
      pageInfo,
      'data.browsertime.pageSummary.statistics.visualMetrics'
    );
    const timings = get(
      pageInfo,
      'data.browsertime.pageSummary.statistics.timings'
    );
    if (visualMetrics) {
      return `Median First Visual Change: ${
        visualMetrics.FirstVisualChange.median
      },
      Median Speed Index: ${visualMetrics.SpeedIndex.median},
      Median Visual Complete 85%: ${visualMetrics.VisualComplete85.median},
      Median Last Visual Change: ${visualMetrics.LastVisualChange.median}`;
    } else if (timings) {
      return `Median RUMSpeedIndex: ${
        timings.rumSpeedIndex.median
      }, Median Fully loaded: ${timings.fullyLoaded.median}`;
    } else {
      return '';
    }
  }
};
