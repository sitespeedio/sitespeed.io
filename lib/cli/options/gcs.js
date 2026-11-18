export function addOptions(yargs) {
  yargs
    .option('gcs.projectId', {
      describe: 'The Google Cloud storage Project ID',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.key', {
      describe:
        'The path to the Google Cloud storage service account key JSON.',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.bucketname', {
      describe: 'Name of the Google Cloud storage bucket',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.public', {
      describe:
        'Make uploaded results to Google Cloud storage publicly readable.',
      default: false,
      type: 'boolean',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.gzip', {
      describe:
        'Add content-encoding for gzip to the uploaded files. Read more at https://cloud.google.com/storage/docs/transcoding. If you host your results directly from the bucket, gzip must be set to false',
      default: false,
      type: 'boolean',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.path', {
      describe:
        "Override the default folder path in the bucket where the results are uploaded. By default it's " +
        '"DOMAIN_OR_FILENAME_OR_SLUG/TIMESTAMP", or the name of the folder if --outputFolder is specified.',
      group: 'GoogleCloudStorage'
    })
    .option('gcs.removeLocalResult', {
      describe:
        'Remove all the local result files after they have been uploaded to Google Cloud storage.',
      default: false,
      type: 'boolean',
      group: 'GoogleCloudStorage'
    });
}
