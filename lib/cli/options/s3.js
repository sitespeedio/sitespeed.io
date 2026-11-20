export function addOptions(yargs) {
  yargs
    .option('s3.endpoint', {
      describe: 'The S3 endpoint. Optional depending on your settings.',
      group: 's3'
    })
    .option('s3.key', {
      describe: 'The S3 key.',
      group: 's3'
    })
    .option('s3.secret', {
      describe: 'The S3 secret.',
      group: 's3'
    })
    .option('s3.bucketname', {
      describe: 'Name of the S3 bucket,',
      group: 's3'
    })
    .option('s3.path', {
      describe:
        "Override the default folder path in the bucket where the results are uploaded. By default it's " +
        '"DOMAIN_OR_FILENAME_OR_SLUG/TIMESTAMP", or the name of the folder if --outputFolder is specified.',
      group: 's3'
    })
    .option('s3.region', {
      describe: 'The S3 region.',
      group: 's3'
    })
    .option('s3.acl', {
      describe:
        'The S3 canned ACL to set. Optional depending on your settings.',
      group: 's3'
    })
    .option('s3.removeLocalResult', {
      describe:
        'Remove all the local result files after they have been uploaded to S3.',
      default: false,
      type: 'boolean',
      group: 's3'
    })
    .option('s3.params', {
      describe:
        'Extra params passed when you do the S3.upload: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property - Example: --s3.params.Expires=31536000 to set expire to one year.',
      group: 's3'
    })
    .option('s3.options', {
      describe:
        'Extra options passed when you create the S3 object: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property - Example: add --s3.options.apiVersion=2006-03-01 to lock to a specific API version.',
      group: 's3'
    });
}
