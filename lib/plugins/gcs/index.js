import { relative, join, resolve, sep } from 'node:path';
import { statSync, remove } from 'fs-extra';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import readdir from 'recursive-readdir';
// Documentation of @google-cloud/storage: https://cloud.google.com/nodejs/docs/reference/storage/2.3.x/Bucket#upload
import { Storage } from '@google-cloud/storage';
import intel from 'intel';
import { throwIfMissing } from '../../support/util';

const log = intel.getLogger('sitespeedio.plugin.gcs');

function ignoreDirectories(file, stats) {
  return stats.isDirectory();
}

async function uploadLatestFiles(dir, gcsOptions, prefix) {
  const storage = new Storage({
    projectId: gcsOptions.projectId,
    keyFilename: gcsOptions.key
  });
  const bucket = storage.bucket(gcsOptions.bucketname);

  const files = await readdir(dir, [ignoreDirectories]);
  const promises = [];

  for (let file of files) {
    promises.push(uploadFile(file, bucket, gcsOptions, prefix, dir, true));
  }
  return Promise.all(promises);
}

async function upload(dir, gcsOptions, prefix) {
  const files = await readdir(dir);
  const promises = [];

  const storage = new Storage({
    projectId: gcsOptions.projectId,
    keyFilename: gcsOptions.key
  });

  const bucket = storage.bucket(gcsOptions.bucketname);

  for (let file of files) {
    const stats = statSync(file);

    if (stats.isFile()) {
      promises.push(uploadFile(file, bucket, gcsOptions, prefix, dir));
    } else {
      log.debug(`Will not upload ${file} since it is not a file`);
    }
  }
  return Promise.all(promises);
}

async function uploadFile(
  file,
  bucket,
  gcsOptions,
  prefix,
  baseDir,
  noCacheTime
) {
  const subPath = relative(baseDir, file);
  const fileName = join(gcsOptions.path || prefix, subPath);

  const parameters = {
    public: !!gcsOptions.public,
    destination: fileName,
    resumable: false,
    validation: 'crc32c',
    gzip: !!gcsOptions.gzip,
    metadata: {
      metadata: {
        cacheControl: 'public, max-age=' + noCacheTime ? 0 : 31_536_000
      }
    }
  };

  return bucket.upload(file, parameters);
}

export default class GcsPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'gcs', options, context, queue });
  }

  open(context, options) {
    this.gcsOptions = options.gcs;
    this.options = options;
    this.make = context.messageMaker('gcs').make;
    throwIfMissing(this.gcsOptions, ['bucketname'], 'gcs');
    this.storageManager = context.storageManager;
  }
  async processMessage(message, queue) {
    if (message.type === 'sitespeedio.setup') {
      // Let other plugins know that the GCS plugin is alive
      queue.postMessage(this.make('gcs.setup'));
    } else if (message.type === 'html.finished') {
      const make = this.make;
      const gcsOptions = this.gcsOptions;
      const baseDir = this.storageManager.getBaseDir();

      log.info(
        `Uploading ${baseDir} to Google Cloud Storage bucket ${gcsOptions.bucketname}, this can take a while ...`
      );

      try {
        await upload(
          baseDir,
          gcsOptions,
          this.storageManager.getStoragePrefix()
        );
        if (this.options.copyLatestFilesToBase) {
          const rootPath = resolve(baseDir, '..');
          const directoriesAsArray = rootPath.split(sep);
          const rootName = directoriesAsArray.slice(-1)[0];
          await uploadLatestFiles(rootPath, gcsOptions, rootName);
        }
        log.info('Finished upload to Google Cloud Storage');
        if (gcsOptions.public) {
          log.info(
            'Uploaded results on Google Cloud storage are publicly readable'
          );
        }
        if (gcsOptions.removeLocalResult) {
          await remove(baseDir);
          log.debug(`Removed local files and directory ${baseDir}`);
        } else {
          log.debug(
            `Local result files and directories are stored in ${baseDir}`
          );
        }
      } catch (error) {
        queue.postMessage(make('error', error));
        log.error('Could not upload to Google Cloud Storage', error);
      }
      queue.postMessage(make('gcs.finished'));
    }
  }
}
