module.exports = {
   pickMedianRun(runs, pageInfo) {
    // Choose the median run. Early first version, in the future we can make
    // this configurable through the CLI
    // If we have SpeedIndex use that else backup with RUM SpeedIndex
    if (pageInfo.data.browsertime && pageInfo.data.browsertime.pageSummary.statistics.visualMetrics) {
      const median = pageInfo.data.browsertime.pageSummary.statistics.visualMetrics.SpeedIndex.median;
      for (var run of runs) {
          if (median === run.data.browsertime.run.visualMetrics.SpeedIndex) {
          return {name: 'SpeedIndex', runIndex: run.runIndex};
        }
      }
    } else if (pageInfo.data.browsertime && pageInfo.data.browsertime.pageSummary.statistics.timings.rumSpeedIndex) {
      const median = pageInfo.data.browsertime.pageSummary.statistics.timings.rumSpeedIndex.median;
      for (var rumRuns of runs) {
        if (rumRuns.data.browsertime && median === rumRuns.data.browsertime.run.timings.rumSpeedIndex) {
          return {name: 'RUMSpeedIndex', runIndex: rumRuns.runIndex};
        }
      }
    }
    return {name: '', runIndex: 0, default: true};
  },
  // Get metrics from a run as a String to use in description
  getMetricsFromRun(locals) {
    // If we have Visual Metrics use them
    if (locals.pageInfo.data.browsertime && locals.pageInfo.data.browsertime.run.visualMetrics) {
      const visualMetrics = locals.pageInfo.data.browsertime.run.visualMetrics;
      return `First Visual Change: ${visualMetrics.FirstVisualChange}, Speed Index: ${visualMetrics.SpeedIndex}, Visual Complete 85%: ${visualMetrics.VisualComplete85}, Last Visual Change: ${visualMetrics.LastVisualChange}`;
    } else if (locals.pageInfo.data.browsertime) {
      const timings = locals.pageInfo.data.browsertime.run.timings;
      return  `RUMSpeedIndex: ${timings.rumSpeedIndex}, Fully loaded: ${timings.fullyLoaded}`;
    } else {
      return '';
    }
  },
  getMetricsFromPageSummary(locals) {
    // If we have Visual Metrics use them
    if (locals.pageInfo.data.browsertime && locals.pageInfo.data.browsertime.pageSummary.statistics.visualMetrics) {
      const visualMetrics = locals.pageInfo.data.browsertime.pageSummary.statistics.visualMetrics;
      return `Median First Visual Change: ${visualMetrics.FirstVisualChange.median}, Median Speed Index: ${visualMetrics.SpeedIndex.median}, Median Visual Complete 85%: ${visualMetrics.VisualComplete85.median}, Median Last Visual Change: ${visualMetrics.LastVisualChange.median}`;
    } else if (locals.pageInfo.data.browsertime.pageSummary.statistics.timings) {
      const timings = locals.pageInfo.data.browsertime.pageSummary.statistics.timings;
      return  `Median RUMSpeedIndex: ${timings.rumSpeedIndex.median}, Median Fully loaded: ${timings.fullyLoaded.median}`;
    } else {
      return '';
    }
  }
};
