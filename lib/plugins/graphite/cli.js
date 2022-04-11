module.exports = {
  host: {
    describe: 'The Graphite host used to store captured metrics.',
    group: 'Graphite'
  },
  port: {
    default: 2003,
    describe: 'The Graphite port used to store captured metrics.',
    group: 'Graphite'
  },
  auth: {
    describe:
      'The Graphite user and password used for authentication. Format: user:password',
    group: 'Graphite'
  },
  httpPort: {
    describe:
      'The Graphite port used to access the user interface and send annotations event',
    default: 8080,
    group: 'Graphite'
  },
  webHost: {
    describe:
      'The graphite-web host. If not specified graphite.host will be used.',
    group: 'Graphite'
  },
  namespace: {
    default: 'sitespeed_io.default',
    describe: 'The namespace key added to all captured metrics.',
    group: 'Graphite'
  },
  includeQueryParams: {
    default: false,
    describe:
      'Whether to include query parameters from the URL in the Graphite keys or not',
    type: 'boolean',
    group: 'Graphite'
  },
  arrayTags: {
    default: true,
    type: 'boolean',
    describe:
      'Send the tags as Array or a String. In Graphite 1.0 the tags is a array. Before a String',
    group: 'Graphite'
  },
  annotationTitle: {
    describe: 'Add a title to the annotation sent for a run.',
    group: 'Graphite'
  },
  annotationMessage: {
    describe:
      'Add an extra message that will be attached to the annotation sent for a run. The message is attached after the default message and can contain HTML.',
    group: 'Graphite'
  },
  annotationScreenshot: {
    default: false,
    type: 'boolean',
    describe:
      'Include screenshot (from Browsertime/WebPageTest) in the annotation. You need to specify a --resultBaseURL for this to work.',
    group: 'Graphite'
  },
  sendAnnotation: {
    default: true,
    type: 'boolean',
    describe:
      'Send annotations when a run is finished. You need to specify a --resultBaseURL for this to work. However if you for example use a Prometheus exporter, you may want to make sure annotations are not sent, then set it to false.',
    group: 'Graphite'
  },
  annotationRetentionMinutes: {
    type: 'number',
    describe:
      'The retention in minutes, to make annotation match the retention in Graphite.',
    group: 'Graphite'
  },
  statsd: {
    default: false,
    type: 'boolean',
    describe: 'Uses the StatsD interface',
    group: 'Graphite'
  },
  annotationTag: {
    describe:
      'Add a extra tag to the annotation sent for a run. Repeat the --graphite.annotationTag option for multiple tags. Make sure they do not collide with the other tags.',
    group: 'Graphite'
  },
  addSlugToKey: {
    default: true,
    type: 'boolean',
    describe:
      'Add the slug (name of the test) as an extra key in the namespace.',
    group: 'Graphite'
  },
  bulkSize: {
    default: null,
    type: 'number',
    describe: 'Break up number of metrics to send with each request.',
    group: 'Graphite'
  },
  skipSummary: {
    default: false,
    type: 'boolean',
    describe:
      'Skip sending summary messages data to Graphite (summaries over a domain).',
    group: 'Graphite'
  },
  perIteration: {
    default: false,
    type: 'boolean',
    describe:
      'Send each iteration of metrics to Graphite. By default we only send page summaries (the summaries of all runs) but you can also send all the runs. Make sure to setup statsd or Graphite correctly to handle it.',
    group: 'Graphite'
  }
};
