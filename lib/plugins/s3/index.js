import { relative, join, resolve as _resolve, sep } from 'node:path';

import fs from 'fs-extra/esm';
import { Endpoint, S3 } from 'aws-sdk';
import readdir from 'recursive-readdir';
import pLimit from 'p-limit';
import intel from 'intel';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { throwIfMissing } from '../../support/util';
import { getContentType } from './contentType';

const log = intel.getLogger('sitespeedio.plugin.s3');

function ignoreDirectories(file, stats) {
  return stats.isDirectory();
}

function createS3(s3Options) {
  let endpoint = s3Options.endpoint || 's3.amazonaws.com';
  const options = {
    endpoint: new Endpoint(endpoint),
    accessKeyId: s3Options.key,
    secretAccessKey: s3Options.secret,
    signatureVersion: 'v4'
  };
  // You can also set some extra options see
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
  Object.assign(options, s3Options.options);
  return new S3(options);
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
  const s3 = createS3(s3Options);
  const files = await readdir(dir, [ignoreDirectories]);
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
    const onUpload = error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };
    const options = { partSize: 10 * 1024 * 1024, queueSize: 1 };
    // See  https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    const subPath = relative(baseDir, file);
    const parameters = {
      Body: stream,
      Bucket: s3Options.bucketname,
      ContentType: contentType,
      Key: join(s3Options.path || prefix, subPath),
      StorageClass: s3Options.storageClass || 'STANDARD'
    };

    if (s3Options.acl) {
      parameters.ACL = s3Options.acl;
    }
    // Override/set all the extra options you need
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    Object.assign(parameters, s3Options.params);

    s3.upload(parameters, options, onUpload);
  });
}

export default class S3Plugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 's3', options, context, queue });
  }
  open(context, options) {
    this.s3Options = options.s3;
    this.options = options;
    this.make = context.messageMaker('s3').make;
    throwIfMissing(this.s3Options, ['bucketname'], 's3');
    if (this.s3Options.key || this.s3Options.secret) {
      throwIfMissing(this.s3Options, ['key', 'secret'], 's3');
    }
    this.storageManager = context.storageManager;
  }
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
          const rootPath = _resolve(baseDir, '..');
          const directoriesAsArray = rootPath.split(sep);
          const rootName = directoriesAsArray.slice(-1)[0];
          await uploadLatestFiles(rootPath, s3Options, rootName);
        }
        log.info('Finished upload to s3');
        if (s3Options.removeLocalResult) {
          await fs.remove(baseDir);
          log.debug(`Removed local files and directory ${baseDir}`);
        }
      } catch (error) {
        queue.postMessage(make('error', error));
        log.error('Could not upload to S3', error);
      }
      queue.postMessage(make('s3.finished'));
    }
  }
}
