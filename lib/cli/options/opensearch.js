export function addOptions(yargs) {
  yargs
    .option('opensearch.host', {
      describe: 'The OpenSearch host to store captured metrics.',
      group: 'OpenSearch'
    })
    .option('opensearch.port', {
      default: 9200,
      describe: 'The OpenSearch port.',
      group: 'OpenSearch'
    })
    .option('opensearch.index', {
      default: 'sitespeed',
      describe:
        'The index name prefix. Indices are created as {prefix}-pagesummary-YYYY.MM.DD, {prefix}-run-YYYY.MM.DD and {prefix}-compare-YYYY.MM.DD.',
      group: 'OpenSearch'
    })
    .option('opensearch.secure', {
      default: false,
      type: 'boolean',
      describe: 'Use HTTPS when connecting to OpenSearch.',
      group: 'OpenSearch'
    })
    .option('opensearch.username', {
      describe: 'OpenSearch username for Basic Auth.',
      group: 'OpenSearch'
    })
    .option('opensearch.password', {
      describe: 'OpenSearch password for Basic Auth.',
      group: 'OpenSearch'
    })
    .option('opensearch.includeRuns', {
      default: false,
      type: 'boolean',
      describe:
        'Send per-iteration run data to OpenSearch in addition to page summaries.',
      group: 'OpenSearch'
    })
    .option('opensearch.runRetentionDays', {
      default: 7,
      type: 'number',
      describe:
        'Number of days to retain per-iteration run data in OpenSearch.',
      group: 'OpenSearch'
    })
    .option('opensearch.retentionDays', {
      default: 90,
      type: 'number',
      describe:
        'Number of days to retain page summary, pagexray, coach and compare data in OpenSearch.',
      group: 'OpenSearch'
    });
}
