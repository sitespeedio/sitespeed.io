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
  bulkSize: {
    default: null,
    type: 'number',
    describe: 'Break up number of metrics to send with each request.',
    group: 'Graphite'
  },
  'experimental.perIteration': {
    default: false,
    type: 'boolean',
    describe:
      'Experimental setup to send each iteration of metrics to Graphite. Experimental means this can change and is not released as stable. Use it with care.',
    group: 'Graphite'
  }
};
