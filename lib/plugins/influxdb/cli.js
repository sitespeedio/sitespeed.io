module.exports = {
  protocol: {
    describe: 'The protocol used to store connect to the InfluxDB host.',
    default: 'http',
    group: 'InfluxDB'
  },
  host: {
    describe: 'The InfluxDB host used to store captured metrics.',
    group: 'InfluxDB'
  },
  port: {
    default: 8086,
    describe: 'The InfluxDB port used to store captured metrics.',
    group: 'InfluxDB'
  },
  username: {
    describe: 'The InfluxDB username for your InfluxDB instance.',
    group: 'InfluxDB'
  },
  password: {
    describe: 'The InfluxDB password for your InfluxDB instance.',
    group: 'InfluxDB'
  },
  database: {
    default: 'sitespeed',
    describe: 'The database name used to store captured metrics.',
    group: 'InfluxDB'
  },
  tags: {
    default: 'category=default',
    describe: 'A comma separated list of tags and values added to each metric',
    group: 'InfluxDB'
  },
  includeQueryParams: {
    default: false,
    describe:
      'Whether to include query parameters from the URL in the InfluxDB keys or not',
    type: 'boolean',
    group: 'InfluxDB'
  },
  groupSeparator: {
    default: '_',
    describe:
      'Choose which character that will seperate a group/domain. Default is underscore, set it to a dot if you wanna keep the original domain name.',
    group: 'InfluxDB'
  },
  annotationScreenshot: {
    default: false,
    type: 'boolean',
    describe:
      'Include screenshot (from Browsertime) in the annotation. You need to specify a --resultBaseURL for this to work.',
    group: 'InfluxDB'
  }
};
