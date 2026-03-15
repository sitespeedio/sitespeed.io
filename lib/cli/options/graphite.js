export function addOptions(yargs) {
  yargs
    .option('graphite.host', {
      describe: 'The Graphite host used to store captured metrics.',
      group: 'Graphite'
    })
    .option('graphite.port', {
      default: 2003,
      describe: 'The Graphite port used to store captured metrics.',
      group: 'Graphite'
    })
    .option('graphite.auth', {
      describe:
        'The Graphite user and password used for authentication. Format: user:password',
      group: 'Graphite'
    })
    .option('graphite.httpPort', {
      describe:
        'The Graphite port used to access the user interface and send annotations event',
      default: 8080,
      group: 'Graphite'
    })
    .option('graphite.webHost', {
      describe:
        'The graphite-web host. If not specified graphite.host will be used.',
      group: 'Graphite'
    })
    .option('graphite.proxyPath', {
      describe:
        'Extra path to graphite-web when behind a proxy, used when sending annotations.',
      default: '',
      group: 'Graphite'
    })
    .option('graphite.namespace', {
      default: 'sitespeed_io.default',
      describe: 'The namespace key added to all captured metrics.',
      group: 'Graphite'
    })
    .option('graphite.includeQueryParams', {
      default: false,
      describe:
        'Whether to include query parameters from the URL in the Graphite keys or not',
      type: 'boolean',
      group: 'Graphite'
    })
    .option('graphite.arrayTags', {
      default: true,
      type: 'boolean',
      describe:
        'Send the tags as Array or a String. In Graphite 1.0 the tags is a array. Before a String',
      group: 'Graphite'
    })
    .option('graphite.annotationTitle', {
      describe: 'Add a title to the annotation sent for a run.',
      group: 'Graphite'
    })
    .option('graphite.annotationMessage', {
      describe:
        'Add an extra message that will be attached to the annotation sent for a run. The message is attached after the default message and can contain HTML.',
      group: 'Graphite'
    })
    .option('graphite.annotationScreenshot', {
      default: false,
      type: 'boolean',
      describe:
        'Include screenshot (from Browsertime) in the annotation. You need to specify a --resultBaseURL for this to work.',
      group: 'Graphite'
    })
    .option('graphite.sendAnnotation', {
      default: true,
      type: 'boolean',
      describe:
        'Send annotations when a run is finished. You need to specify a --resultBaseURL for this to work. However if you for example use a Prometheus exporter, you may want to make sure annotations are not sent, then set it to false.',
      group: 'Graphite'
    })
    .option('graphite.annotationRetentionMinutes', {
      type: 'number',
      describe:
        'The retention in minutes, to make annotation match the retention in Graphite.',
      group: 'Graphite'
    })
    .option('graphite.statsd', {
      default: false,
      type: 'boolean',
      describe: 'Uses the StatsD interface',
      group: 'Graphite'
    })
    .option('graphite.annotationTag', {
      describe:
        'Add a extra tag to the annotation sent for a run. Repeat the --graphite.annotationTag option for multiple tags. Make sure they do not collide with the other tags.',
      group: 'Graphite'
    })
    .option('graphite.addSlugToKey', {
      default: true,
      type: 'boolean',
      describe:
        'Add the slug (name of the test) as an extra key in the namespace.',
      group: 'Graphite'
    })
    .option('graphite.bulkSize', {
      default: undefined,
      type: 'number',
      describe: 'Break up number of metrics to send with each request.',
      group: 'Graphite'
    })
    .option('graphite.messages', {
      default: ['pageSummary', 'summary'],
      options: ['pageSummary', 'summary', 'run'],
      describe:
        'Define which messages to send to Graphite. By default we do not send data per run, but you can change that by adding run as one of the options',
      group: 'Graphite'
    });
}
