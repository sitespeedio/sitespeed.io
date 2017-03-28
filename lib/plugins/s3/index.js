'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.s3');
const s3 = require('s3');
const Promise = require('bluebird');
const throwIfMissing = require('../../support/util').throwIfMissing;
const fs = require('fs-extra');
const pick = require('lodash.pick');

Promise.promisifyAll(fs);

function createS3Client(s3Options) {
  const clientOptions = pick(s3Options,
    ['maxAsyncS3', 's3RetryCount', 's3RetryDelay', 'multipartUploadThreshold', 'multipartUploadSize']);

  clientOptions.s3Options = {
    accessKeyId: s3Options.key,
    secretAccessKey: s3Options.secret,
    region: s3Options.region
  };

  return s3.createClient(clientOptions);
}

module.exports = {
  open(context, options) {
    const s3Options = options.s3;

    throwIfMissing(s3Options, ['bucketname'], 's3');
    if (s3Options.key || s3Options.secret) {
      throwIfMissing(s3Options, ['key', 'secret'], 's3');
    }
    this.storageManager = context.storageManager;
  },

  postClose(options) {
    const s3Options = options.s3;
    const client = createS3Client(s3Options);

    const baseDir = this.storageManager.getBaseDir();

    const params = {
      localDir: baseDir,
      s3Params: {
        Bucket: s3Options.bucketname,
        Prefix: s3Options.path || this.storageManager.getStoragePrefix()
        // other options supported by putObject, except Body and ContentLength.
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
      }
    };

    return new Promise((resolve, reject) => {
      log.info(`Uploading ${baseDir} to S3 bucket ${s3Options.bucketname}, this can take a while ...`);

      const uploader = client.uploadDir(params);

      uploader.on('error', err => {
        log.error('Could not upload to S3', err);
        reject(err);
      });
      uploader.on('end', () => {
        if (s3Options.removeLocalResult) {
          fs.removeAsync(baseDir)
            .then(() => {
              log.info(`Removed local files and directory ${baseDir}`);
              resolve();
            })
            .catch((e) => reject(e));
        } else {
          resolve();
        }
      });
    });
  }
};
