import path from 'node:path';
import { promises as fsPromises } from 'node:fs';

import { getLogger } from '@sitespeed.io/log';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { throwIfMissing } from '../../support/util.js';
import { recursiveReaddir } from '../../support/fileUtil.js';
import { getContentType } from './contentType.js';
import { runWithConcurrencyLimit } from './limit.js';

const log = getLogger('sitespeedio.plugin.s3');

const normalizeExpires = maybeSeconds => {
  if (typeof maybeSeconds === 'number' && Number.isFinite(maybeSeconds)) {
    const seconds = Number.parseInt(maybeSeconds, 10);
    const expires = new Date(Date.now() + seconds * 1000);
    log.info('Setting s3.expires to ' + expires);
    return expires;
  }
  return maybeSeconds;
};

async function uploadFile(file, s3Client, s3Options, prefix, baseDir) {
  const stream = await fsPromises.readFile(file);
  const contentType = getContentType(file);
  const subPath = path.relative(baseDir, file);
  const baseParams = {
    Bucket: s3Options.bucketname,
    Key: path.join(s3Options.path || prefix, subPath),
    Body: stream,
    ContentType: contentType,
    ACL: s3Options.acl
  };

  const userParams = { ...s3Options.params };
  if ('Expires' in userParams) {
    userParams.Expires = normalizeExpires(userParams.Expires);
  }

  const parameters = { ...baseParams, ...userParams };

  try {
    await s3Client.send(new PutObjectCommand(parameters));
    log.debug(`Uploaded ${file} to S3 bucket ${s3Options.bucketname}`);
  } catch (error) {
    log.error(
      `Error uploading ${file} to S3 bucket ${s3Options.bucketname}:`,
      error
    );
    throw error;
  }
}

export default class S3Plugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 's3', options, context, queue });
  }

  open(context, options) {
    this.s3Options = options.s3;
    this.options = options;
    this.make = context.messageMaker('s3').make;
    throwIfMissing(this.s3Options, ['bucketname', 'region'], 's3');
    if (this.s3Options.key || this.s3Options.secret) {
      throwIfMissing(this.s3Options, ['key', 'secret'], 's3');
    }
    this.storageManager = context.storageManager;

    const s3CLientOptions = {
      region: this.s3Options.region
    };
    Object.assign(s3CLientOptions, this.s3Options.options);

    if (this.s3Options.endpoint) {
      s3CLientOptions.endpoint = this.s3Options.endpoint;
    }

    if (this.s3Options.key) {
      s3CLientOptions.credentials = {
        accessKeyId: this.s3Options.key,
        secretAccessKey: this.s3Options.secret
      };
    }

    this.s3Client = new S3Client(s3CLientOptions);
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
        const files = await recursiveReaddir(baseDir);
        const tasks = files.map(file => async () => {
          return uploadFile(
            file,
            this.s3Client,
            s3Options,
            this.storageManager.getStoragePrefix(),
            baseDir
          );
        });

        await runWithConcurrencyLimit(tasks, s3Options.maxAsyncS3 || 20);

        if (this.options.copyLatestFilesToBase) {
          const rootPath = path.join(baseDir, '..');
          const directoriesAsArray = rootPath.split(path.sep);
          const rootName = directoriesAsArray.at(-1);
          const latestFiles = await recursiveReaddir(rootPath, true);
          const latestTasks = latestFiles.map(file => async () => {
            return uploadFile(
              file,
              this.s3Client,
              s3Options,
              rootName,
              rootPath
            );
          });
          await runWithConcurrencyLimit(
            latestTasks,
            s3Options.maxAsyncS3 || 20
          );
        }

        log.info('Finished upload to S3');
        if (s3Options.removeLocalResult) {
          await fsPromises.rm(baseDir, { recursive: true });
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
