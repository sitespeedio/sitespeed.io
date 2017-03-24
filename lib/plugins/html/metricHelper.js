module.exports = {
   pickMedianRun(runs, pageInfo) {
    // Choose the median run. Early first version, in the future we can make
    // this configurable through the CLI
    // If we have SpeedIndex use that else backup with RUM SpeedIndex
    if (pageInfo.data.browsertime.pageSummary.statistics.visualMetrics) {
      const median = pageInfo.data.browsertime.pageSummary.statistics.visualMetrics.SpeedIndex.median;
      for (var run of runs) {
          if (median === run.data.browsertime.run.visualMetrics.SpeedIndex) {
          return {name: 'SpeedIndex', runIndex: run.runIndex};
        }
      }
      return {name: 'SpeedIndex', runIndex: 0, default: true};
    } else {
      const median = pageInfo.data.browsertime.pageSummary.statistics.timings.rumSpeedIndex.median;
      for (var rumRuns of runs) {
        if (median === rumRuns.data.browsertime.run.timings.rumSpeedIndex) {
          return {name: 'RUMSpeedIndex', runIndex: rumRuns.runIndex};
        }
      }
    }
    return {name: 'RUMSpeedIndex', runIndex: 0, default: true};
  }
};
