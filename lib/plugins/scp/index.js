import path from 'node:path';
import fs from 'node:fs';

import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { Client } from 'node-scp';
import intel from 'intel';
import { throwIfMissing } from '../../support/util.js';
import { recursiveReaddir } from '../../support/fileUtil.js';

const log = intel.getLogger('sitespeedio.plugin.scp');

async function getClient(scpOptions) {
  const options = {
    host: scpOptions.host,
    port: scpOptions.port || 22
  };
  if (scpOptions.username) {
    options.username = scpOptions.username;
  }
  if (scpOptions.password) {
    options.password = scpOptions.password;
  }
  if (scpOptions.privateKey) {
    options.privateKey = fs.readFileSync(scpOptions.privateKey);
  }
  if (scpOptions.passphrase) {
    options.passphrase = scpOptions.passphrase;
  }
  return await Client(options);
}

async function upload(dir, scpOptions, prefix) {
  let client;
  try {
    client = await getClient(scpOptions);
    const directories = prefix.split('/');
    let fullPath = '';
    for (let dir of directories) {
      fullPath += dir + '/';
      const doThePathExist = await client.exists(
        path.join(scpOptions.destinationPath, fullPath)
      );
      if (!doThePathExist) {
        await client.mkdir(path.join(scpOptions.destinationPath, fullPath));
      }
    }
    await client.uploadDir(dir, path.join(scpOptions.destinationPath, prefix));
  } catch (error) {
    log.error(error);
    throw error;
  } finally {
    if (client) {
      client.close();
    }
  }
}

async function uploadFiles(files, scpOptions, prefix) {
  let client;
  try {
    client = await getClient(scpOptions);
    for (let file of files) {
      await client.uploadFile(
        file,
        path.join(scpOptions.destinationPath, prefix, path.basename(file))
      );
    }
  } catch (error) {
    log.error(error);
    throw error;
  } finally {
    if (client) {
      client.close();
    }
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
