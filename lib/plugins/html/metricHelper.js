import get from 'lodash.get';

export function pickMedianRun(runs, pageInfo) {
  // Choose the median run. Early first version, in the future we can make
  // this configurable through the CLI
  // If we have SpeedIndex use that else backup with loadEventEnd
  const speedIndexMedian = get(
    pageInfo,
    'data.browsertime.pageSummary.statistics.visualMetrics.SpeedIndex.median'
  );
  const loadEventEndMedian = get(
    pageInfo,
    'data.browsertime.pageSummary.statistics.timings.loadEventEnd.median'
  );
  if (speedIndexMedian) {
    for (let run of runs) {
      if (
        // https://github.com/sitespeedio/sitespeed.io/issues/3618
        run.data.browsertime.run.visualMetrics &&
        speedIndexMedian === run.data.browsertime.run.visualMetrics.SpeedIndex
      ) {
        return {
          name: 'SpeedIndex',
          runIndex: run.runIndex + 1
        };
      }
    }
  } else if (loadEventEndMedian) {
    for (let rumRuns of runs) {
      // make sure we run Browsertime for that run = 3 runs WPT and 2 runs BT
      if (
        rumRuns.data.browsertime &&
        loadEventEndMedian === rumRuns.data.browsertime.run.timings.loadEventEnd
      ) {
        return {
          name: 'LoadEventEnd',
          runIndex: rumRuns.runIndex + 1
        };
      }
    }
  }
  return {
    name: '',
    runIndex: 1,
    default: true
  };
}
// Single-line summaries used as the page's <meta name="description">.
// Keep as one line so search engines and bookmark previews don't show
// the source-code indentation, and so that screen readers don't pause
// on every newline.
export function getMetricsFromRun(pageInfo) {
  const visualMetrics = get(pageInfo, 'data.browsertime.run.visualMetrics');
  const timings = get(pageInfo, 'data.browsertime.run.timings');
  if (visualMetrics) {
    return `First Visual Change: ${visualMetrics.FirstVisualChange}, Speed Index: ${visualMetrics.SpeedIndex}, Visual Complete 85%: ${visualMetrics.VisualComplete85}, Last Visual Change: ${visualMetrics.LastVisualChange}`;
  }
  if (timings && timings.loadEventEnd) {
    return `Load Event End: ${timings.loadEventEnd}`;
  }
  return '';
}
export function getMetricsFromPageSummary(pageInfo) {
  const visualMetrics = get(
    pageInfo,
    'data.browsertime.pageSummary.statistics.visualMetrics'
  );
  const timings = get(
    pageInfo,
    'data.browsertime.pageSummary.statistics.timings'
  );
  if (visualMetrics) {
    return `Median First Visual Change: ${visualMetrics.FirstVisualChange.median}, Median Speed Index: ${visualMetrics.SpeedIndex.median}, Median Visual Complete 85%: ${visualMetrics.VisualComplete85.median}, Median Last Visual Change: ${visualMetrics.LastVisualChange.median}`;
  }
  // Previous version had a chained ternary whose `'' + timings.fullyLoaded`
  // expression was always truthy, so the fullyLoaded fallback never fired.
  if (timings) {
    if (timings.loadEventEnd) {
      return `Median Load Event End: ${timings.loadEventEnd.median}`;
    }
    if (timings.fullyLoaded) {
      return `Median Fully Loaded: ${timings.fullyLoaded.median}`;
    }
  }
  return '';
}
