'use strict';

const fs = require('fs-extra');
const path = require('path');
const readdir = require('recursive-readdir');
// Documentation of @google-cloud/storage: https://cloud.google.com/nodejs/docs/reference/storage/2.3.x/Bucket#upload
const { Storage } = require('@google-cloud/storage');

const log = require('intel').getLogger('sitespeedio.plugin.gcs');
const throwIfMissing = require('../../support/util').throwIfMissing;

async function upload(dir, gcsOptions, prefix) {
  const files = await readdir(dir);
  const promises = [];

  const storage = new Storage({
    projectId: gcsOptions.projectId,
    keyFilename: gcsOptions.key
  });

  const bucket = storage.bucket(gcsOptions.bucketname);

  for (let file of files) {
    promises.push(uploadFile(file, bucket, gcsOptions, prefix, dir));
  }
  return Promise.all(promises);
}

async function uploadFile(file, bucket, gcsOptions, prefix, baseDir) {
  const subPath = path.relative(baseDir, file);
  const fileName = path.join(gcsOptions.path || prefix, subPath);

  const params = {
    public: !!gcsOptions.public,
    destination: fileName,
    resumable: true,
    validation: 'crc32c',
    gzip: true,
    metadata: {
      metadata: {
        cacheControl: 'public, max-age=31536000'
      }
    }
  };

  return bucket.upload(file, params);
}

module.exports = {
  open(context, options) {
    this.gcsOptions = options.gcs;
    this.make = context.messageMaker('gcs').make;
    throwIfMissing(this.gcsOptions, ['projectId'], 'gcs');
    throwIfMissing(this.gcsOptions, ['key'], 'gcs');
    throwIfMissing(this.gcsOptions, ['bucketname'], 'gcs');
    this.storageManager = context.storageManager;
  },

  async processMessage(message, queue) {
    if (message.type === 'html.finished') {
      const make = this.make;
      const gcsOptions = this.gcsOptions;
      const baseDir = this.storageManager.getBaseDir();

      log.info(
        `Uploading ${baseDir} to Google Cloud Storage bucket ${
          gcsOptions.bucketname
        }, this can take a while ...`
      );

      try {
        await upload(
          baseDir,
          gcsOptions,
          this.storageManager.getStoragePrefix()
        );
        log.info('Finished upload to Google Cloud Storage');
        if (gcsOptions.public) {
          log.info(
            'Uploaded results on Google Cloud storage are publicly readable'
          );
        }
        if (gcsOptions.removeLocalResult) {
          await fs.remove(baseDir);
          log.debug(`Removed local files and directory ${baseDir}`);
        }
      } catch (e) {
        log.error('Could not upload to Google Cloud Storage', e);
      }
      queue.postMessage(make('gcs.finished'));
    }
  }
};
