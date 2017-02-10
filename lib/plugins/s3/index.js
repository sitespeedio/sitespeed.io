'use strict';

const path = require('path');
const log = require('intel');
const s3 = require('s3');
const Promise = require('bluebird');
const throwIfMissing = require('../../support/util').throwIfMissing;
const fs = require('fs-extra');

Promise.promisifyAll(fs);

function getClient(options) {
  if (options.s3.key && options.s3.secret) {
    return s3.createClient({
      s3Options: {
        accessKeyId: options.s3.key,
        secretAccessKey: options.s3.secret
      }
    });
  } else {
    return s3.createClient();
  }
}

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    throwIfMissing(options.s3, ['bucketname'], 's3');
    if (options.s3.key || options.s3.secret) {
      throwIfMissing(options.s3, ['key', 'secret'], 's3');
    }
    this.storageManager = context.storageManager;
  },

  postClose(options) {
    const client = getClient(options);

    const params = {
      localDir: this.storageManager.getBaseDir(),
      deleteRemoved: false,
      s3Params: {
        Bucket: options.s3.bucketname,
        // maybe just skipr default sitespeed-result?
        Prefix: this.storageManager.getRelativeBaseDir()
          // other options supported by putObject, except Body and ContentLength.
          // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
      },
    };
    return new Promise((resolve, reject) => {
      log.info('Uploading to S3 %s, this can take a while ...', options.s3.bucketname);
      const uploader = client.uploadDir(params);
      const storageManager = this.storageManager;
      uploader.on('error', function(err) {
        log.error('Could not upload to S3', err);
        reject(err);
      });
      uploader.on('progress', function() {
        log.trace("S3 upload progress", uploader.progressMd5Amount,
          uploader.progressAmount, uploader.progressTotal);
      });
      uploader.on('end', function() {
        if (options.s3.removeLocalResult) {
          fs.removeAsync(storageManager.getBaseDir()).then(() => {
            log.info('Removed local files and directory %s', storageManager.getBaseDir());
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }
};
