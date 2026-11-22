export function addOptions(yargs) {
  yargs
    .option('trend.enable', {
      type: 'boolean',
      describe:
        'Find out if a page got slower over time. Compares the median of the last 4 tests with the 28 tests before. Needs Python with scipy, like the compare plugin.',
      group: 'trend'
    })
    .option('trend.path', {
      type: 'string',
      describe:
        'The folder for the trend history, one file for each page. Keep the folder between tests, for example mount it when you run in Docker. Default is --compare.baselinePath, and without it the current folder.',
      group: 'trend'
    })
    .option('trend.metrics', {
      type: 'array',
      nargs: 1,
      default: [
        'googleWebVitals.largestContentfulPaint',
        'googleWebVitals.firstContentfulPaint'
      ],
      describe:
        'A metric to follow, as its path in the statistics of the browsertime page summary. Repeat the option to follow more metrics. Lower values must be better.',
      group: 'trend'
    })
    .option('trend.minChangePercent', {
      type: 'number',
      default: 10,
      describe:
        'The smallest change in percent of the baseline median that counts as slower. Use a lower value, for example 2, for WebPageReplay tests.',
      group: 'trend'
    })
    .option('trend.minChangeValue', {
      type: 'number',
      default: 100,
      describe:
        'The smallest change in the unit of the metric (milliseconds for timings) that counts as slower. Use a lower value, for example 10, for WebPageReplay tests.',
      group: 'trend'
    });
}
