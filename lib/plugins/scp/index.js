'use strict';

const fs = require('fs-extra');
const path = require('path');
const { Client } = require('node-scp');
const readdir = require('recursive-readdir');
const log = require('intel').getLogger('sitespeedio.plugin.scp');
const throwIfMissing = require('../../support/util').throwIfMissing;

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
    options.privateKey = scpOptions.privateKey;
  }
  if (scpOptions.passphrase) {
    options.passphrase = scpOptions.passphrase;
  }
  return await Client(options);
}

async function upload(dir, scpOptions) {
  let client;
  try {
    client = await getClient(scpOptions);
    await client.uploadDir(dir, scpOptions.destinationPath);
  } catch (e) {
    log.error(e);
  } finally {
    if (client) {
      client.close();
    }
  }
}

async function uploadFiles(files, scpOptions) {
  let client;
  try {
    client = await getClient(scpOptions);
    for (let file of files) {
      await client.uploadFile(file, scpOptions.destinationPath);
    }
  } catch (e) {
    log.error(e);
  } finally {
    if (client) {
      client.close();
    }
  }
}

async function uploadLatestFiles(dir, scpOptions) {
  function ignoreDirs(file, stats) {
    return stats.isDirectory();
  }
  const files = await readdir(dir, [ignoreDirs]);

  return uploadFiles(files, scpOptions);
}

module.exports = {
  open(context, options) {
    this.scpOptions = options.scp;
    this.options = options;
    this.make = context.messageMaker('scp').make;
    throwIfMissing(this.scp, ['host', 'destinationPath'], 'scp');
    this.storageManager = context.storageManager;
  },

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
        await upload(baseDir, this.scpOptions);
        if (this.options.copyLatestFilesToBase) {
          const rootPath = path.resolve(baseDir, '..');
          await uploadLatestFiles(rootPath, this.scpOptions);
        }
        log.info('Finished upload using scp');
        if (this.scpOtions.removeLocalResult) {
          await fs.remove(baseDir);
          log.debug(`Removed local files and directory ${baseDir}`);
        }
      } catch (e) {
        queue.postMessage(make('error', e));
        log.error('Could not upload using scp', e);
      }
      queue.postMessage(make('scp.finished'));
    }
  }
};
