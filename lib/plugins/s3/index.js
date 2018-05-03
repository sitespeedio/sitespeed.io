'use strict';

const fs = require('fs');
const AWS = require('aws-sdk');
const readdir = require('recursive-readdir');
const pLimit = require('p-limit');

const log = require('intel').getLogger('sitespeedio.plugin.s3');
const throwIfMissing = require('../../support/util').throwIfMissing;
const { getContentType } = require('./contentType');

function getExt(filename) {
  return filename.split('.').pop();
}

function createS3(s3Options) {
  const options = {
    region: s3Options.region,
    accessKeyId: s3Options.key,
    secretAccessKey: s3Options.secret,
    signatureVersion: 'v4'
  };
  // You can also set some extra options see
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
  if (s3Options.options) {
    for (let key of Object.getKeys(s3Options.options)) {
      options[key] = s3Options.options[key];
    }
  }
  return new AWS.S3(options);
}

async function upload(dir, s3Options, prefix) {
  const s3 = createS3(s3Options);
  const files = await readdir(dir);
  // Backward compability naming for old S3 plugin
  const limit = pLimit(s3Options.maxAsyncS3 || 20);
  const promises = [];

  for (let file of files) {
    promises.push(limit(() => uploadFile(file, s3, s3Options, prefix, dir)));
  }
  return Promise.all(promises);
}

async function uploadFile(file, s3, s3Options, prefix, baseDir) {
  const stream = fs.createReadStream(file);
  const fileExtension = getExt(file);
  const contentType = getContentType(fileExtension);
  return new Promise((resolve, reject) => {
    const onUpload = err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    };
    const options = { partSize: 10 * 1024 * 1024, queueSize: 1 };
    const params = {
      Body: stream,
      Bucket: s3Options.bucketname,
      ContentType: contentType,
      Prefix: s3Options.path || prefix,
      Key: prefix + file.replace(baseDir, ''), // TODO is this correct if we set the path?
      // Allow user to set default StorageClass on objects and default to STANDARD if not set
      // Possible options [STANDARD | REDUCED_REDUNDANCY | STANDARD_IA]
      StorageClass: s3Options.storageClass || 'STANDARD'
    };

    if (s3Options.acl) {
      params.ACL = s3Options.acl;
    }
    if (s3Options.params) {
      // Override/set all the extra options you need
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
      for (let key of Object.getKeys(s3Options.params)) {
        params[key] = s3Options.params[key];
      }
    }

    s3.upload(params, options, onUpload);
  });
}

module.exports = {
  open(context, options) {
    this.s3Options = options.s3;
    this.make = context.messageMaker('s3').make;
    throwIfMissing(this.s3Options, ['bucketname'], 's3');
    if (this.s3Options.key || this.s3Options.secret) {
      throwIfMissing(this.s3Options, ['key', 'secret'], 's3');
    }
    this.storageManager = context.storageManager;
  },

  async processMessage(message, queue) {
    if (message.type === 'html.finished') {
      const make = this.make;
      const s3Options = this.s3Options;
      const baseDir = this.storageManager.getBaseDir();

      log.info(
        `Uploading ${baseDir} to S3 bucket ${
          s3Options.bucketname
        }, this can take a while ...`
      );

      try {
        await upload(
          baseDir,
          s3Options,
          this.storageManager.getStoragePrefix()
        );
        log.info('Finished upload to s3');
        if (s3Options.removeLocalResult) {
          await fs.remove(baseDir);
          log.debug(`Removed local files and directory ${baseDir}`);
          queue.postMessage(make('s3.finished'));
        } else {
          queue.postMessage(make('s3.finished'));
        }
      } catch (e) {
        log.error('Could not upload to S3', e);
        queue.postMessage(make('s3.finished'));
      }
    }
  }
};
