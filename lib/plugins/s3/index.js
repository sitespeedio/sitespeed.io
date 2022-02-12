'use strict';

const fs = require('fs-extra');
const path = require('path');
const AWS = require('aws-sdk');
const readdir = require('recursive-readdir');
const pLimit = require('p-limit');

const log = require('intel').getLogger('sitespeedio.plugin.s3');
const throwIfMissing = require('../../support/util').throwIfMissing;
const { getContentType } = require('./contentType');

function createS3(s3Options) {
  let endpoint = s3Options.endpoint || 's3.amazonaws.com';
  const options = {
    endpoint: new AWS.Endpoint(endpoint),
    accessKeyId: s3Options.key,
    secretAccessKey: s3Options.secret,
    signatureVersion: 'v4'
  };
  // You can also set some extra options see
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
  Object.assign(options, s3Options.options);
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

async function uploadLatestFiles(dir, s3Options, prefix) {
  function ignoreDirs(file, stats) {
    return stats.isDirectory();
  }

  const s3 = createS3(s3Options);
  const files = await readdir(dir, [ignoreDirs]);
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
  const contentType = getContentType(file);
  return new Promise((resolve, reject) => {
    const onUpload = err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    };
    const options = { partSize: 10 * 1024 * 1024, queueSize: 1 };
    // See  https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    const subPath = path.relative(baseDir, file);
    const params = {
      Body: stream,
      Bucket: s3Options.bucketname,
      ContentType: contentType,
      Key: path.join(s3Options.path || prefix, subPath),
      StorageClass: s3Options.storageClass || 'STANDARD'
    };

    if (s3Options.acl) {
      params.ACL = s3Options.acl;
    }
    // Override/set all the extra options you need
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    Object.assign(params, s3Options.params);

    s3.upload(params, options, onUpload);
  });
}

module.exports = {
  open(context, options) {
    this.s3Options = options.s3;
    this.options = options;
    this.make = context.messageMaker('s3').make;
    throwIfMissing(this.s3Options, ['bucketname'], 's3');
    if (this.s3Options.key || this.s3Options.secret) {
      throwIfMissing(this.s3Options, ['key', 'secret'], 's3');
    }
    this.storageManager = context.storageManager;
  },

  async processMessage(message, queue) {
    if (message.type === 'sitespeedio.setup') {
      // Let other plugins know that the s3 plugin is alive
      queue.postMessage(this.make('s3.setup'));
    } else if (message.type === 'html.finished') {
      const make = this.make;
      const s3Options = this.s3Options;
      const baseDir = this.storageManager.getBaseDir();

      log.info(
        `Uploading ${baseDir} to S3 bucket ${s3Options.bucketname}, this can take a while ...`
      );

      try {
        await upload(
          baseDir,
          s3Options,
          this.storageManager.getStoragePrefix()
        );
        if (this.options.copyLatestFilesToBase) {
          const rootPath = path.resolve(baseDir, '..');
          const dirsAsArray = rootPath.split(path.sep);
          const rootName = dirsAsArray.slice(-1)[0];
          await uploadLatestFiles(rootPath, s3Options, rootName);
        }
        log.info('Finished upload to s3');
        if (s3Options.removeLocalResult) {
          await fs.remove(baseDir);
          log.debug(`Removed local files and directory ${baseDir}`);
        }
      } catch (e) {
        queue.postMessage(make('error', e));
        log.error('Could not upload to S3', e);
      }
      queue.postMessage(make('s3.finished'));
    }
  }
};
