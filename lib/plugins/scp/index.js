import path from 'node:path';
import fs from 'node:fs';

import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import SftpClient from 'ssh2-sftp-client';
import { getLogger } from '@sitespeed.io/log';
import { throwIfMissing } from '../../support/util.js';
import { recursiveReaddir } from '../../support/fileUtil.js';

const log = getLogger('sitespeedio.plugin.scp');

const CONCURRENT_UPLOADS = 16;
const CONNECT_RETRIES = 3;

async function connectWithRetry(client, config) {
  for (let attempt = 1; ; attempt++) {
    try {
      await client.connect(config);
      return;
    } catch (error) {
      if (attempt > CONNECT_RETRIES) throw error;
      log.info(
        `scp connect failed (attempt ${attempt}/${CONNECT_RETRIES}), retrying: ${error.message}`
      );
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

function buildConnectConfig(scpOptions) {
  const config = {
    host: scpOptions.host,
    port: scpOptions.port || 22,
    promiseLimit: CONCURRENT_UPLOADS
  };
  if (scpOptions.username) {
    config.username = scpOptions.username;
  }
  if (scpOptions.password) {
    config.password = scpOptions.password;
  }
  if (scpOptions.privateKey) {
    config.privateKey = fs.readFileSync(scpOptions.privateKey);
  }
  if (scpOptions.passphrase) {
    config.passphrase = scpOptions.passphrase;
  }
  return config;
}

async function upload(dir, scpOptions, prefix) {
  const client = new SftpClient();
  try {
    await connectWithRetry(client, buildConnectConfig(scpOptions));
    const target = path.join(scpOptions.destinationPath, prefix);
    if (!(await client.exists(target))) {
      await client.mkdir(target, true);
    }
    await client.uploadDir(dir, target, { useFastput: true });
  } catch (error) {
    log.error(`Error uploading dir ` + error);
    throw error;
  } finally {
    await client.end();
  }
}

async function uploadFiles(files, scpOptions, prefix) {
  const client = new SftpClient();
  try {
    await connectWithRetry(client, buildConnectConfig(scpOptions));
    const target = path.join(scpOptions.destinationPath, prefix);
    if (!(await client.exists(target))) {
      await client.mkdir(target, true);
    }
    for (let i = 0; i < files.length; i += CONCURRENT_UPLOADS) {
      const batch = files.slice(i, i + CONCURRENT_UPLOADS);
      await Promise.all(
        batch.map(file =>
          client.fastPut(file, path.join(target, path.basename(file)))
        )
      );
    }
  } catch (error) {
    log.error(`Error uploading files ` + error);
    throw error;
  } finally {
    await client.end();
  }
}

async function uploadLatestFiles(dir, scpOptions, prefix) {
  const files = await recursiveReaddir(dir, true);

  return uploadFiles(files, scpOptions, prefix);
}

export default class ScpPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'scp', options, context, queue });
  }
  open(context, options) {
    this.scpOptions = options.scp;
    this.options = options;
    this.make = context.messageMaker('scp').make;
    throwIfMissing(
      this.scpOptions,
      ['host', 'destinationPath', 'username'],
      'scp'
    );
    this.storageManager = context.storageManager;
  }
  async processMessage(message, queue) {
    if (message.type === 'sitespeedio.setup') {
      // Let other plugins know that the scp plugin is alive
      queue.postMessage(this.make('scp.setup'));
    } else if (message.type === 'html.finished') {
      const make = this.make;
      const baseDir = this.storageManager.getBaseDir();

      log.info(
        `Uploading ${baseDir} using scp bucket, this can take a while ...`
      );

      try {
        await upload(
          baseDir,
          this.scpOptions,
          this.storageManager.getStoragePrefix()
        );
        if (this.options.copyLatestFilesToBase) {
          const rootPath = path.resolve(baseDir, '..');
          const prefix = this.storageManager.getStoragePrefix();
          const firstPart = prefix.split('/')[0];
          await uploadLatestFiles(rootPath, this.scpOptions, firstPart);
        }
        log.info('Finished upload using scp');
        if (this.scpOptions.removeLocalResult) {
          fs.rmSync(baseDir, { recursive: true });
          log.debug(`Removed local files and directory ${baseDir}`);
        }
      } catch (error) {
        queue.postMessage(make('error', error));
        log.error('Could not upload using scp', error);
      }
      queue.postMessage(make('scp.finished'));
    }
  }
}
