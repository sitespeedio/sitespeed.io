module.exports = {
  host: {
    describe: 'The Grafana host used when sending annotations.',
    group: 'Grafana'
  },
  port: {
    default: 80,
    describe: 'The Grafana port used when sending annotations to Grafana.',
    group: 'Grafana'
  },
  auth: {
    describe:
      'The Grafana auth/bearer value used when sending annotations to Grafana. If you do not set Bearer/Auth, Bearer is automatically set. See http://docs.grafana.org/http_api/auth/#authentication-api',
    group: 'Grafana'
  },
  annotationTitle: {
    describe: 'Add a title to the annotation sent for a run.',
    group: 'Grafana'
  },
  annotationMessage: {
    describe:
      'Add an extra message that will be attached to the annotation sent for a run. The message is attached after the default message and can contain HTML.',
    group: 'Grafana'
  },
  annotationTag: {
    describe:
      'Add a extra tag to the annotation sent for a run. Repeat the --grafana.annotationTag option for multiple tags. Make sure they do not collide with the other tags.',
    group: 'Grafana'
  },
  annotationScreenshot: {
    default: false,
    type: 'boolean',
    describe:
      'Include screenshot (from Browsertime/WebPageTest) in the annotation. You need to specify a --resultBaseURL for this to work.',
    group: 'Grafana'
  }
};
