import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import { getLogger } from '@sitespeed.io/log';
import { throwIfMissing } from '../../support/util.js';
import { recursiveReaddir } from '../../support/fileUtil.js';

const log = getLogger('sitespeedio.plugin.rsync');

function buildSshArgs(rsyncOptions) {
  const args = ['-p', String(rsyncOptions.port || 22)];
  if (rsyncOptions.privateKey) {
    args.push('-i', rsyncOptions.privateKey);
  }
  args.push(
    '-o',
    'StrictHostKeyChecking=no',
    '-o',
    'UserKnownHostsFile=/dev/null'
  );
  return args;
}

function quoteArg(arg) {
  if (/^[\w@:/.=-]+$/.test(arg)) return arg;
  return `'${arg.replaceAll(`'`, String.raw`'\''`)}'`;
}

function buildSshCommandString(rsyncOptions) {
  const parts = ['ssh', ...buildSshArgs(rsyncOptions)];
  return parts.map(arg => quoteArg(arg)).join(' ');
}

function wrapWithSshpass(rsyncOptions, command, args) {
  if (!rsyncOptions.password) return { command, args, env: undefined };
  return {
    command: 'sshpass',
    args: ['-e', command, ...args],
    env: { ...process.env, SSHPASS: rsyncOptions.password }
  };
}

function run(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env });
    let stderr = '';
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });
    child.on('error', error => reject(error));
    child.on('close', code => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `${command} exited with code ${code}${stderr ? ': ' + stderr.trim() : ''}`
          )
        );
    });
  });
}

async function ensureRemoteDir(rsyncOptions, remotePath) {
  const sshArgs = [
    ...buildSshArgs(rsyncOptions),
    `${rsyncOptions.username}@${rsyncOptions.host}`,
    'mkdir',
    '-p',
    remotePath
  ];
  const { command, args, env } = wrapWithSshpass(rsyncOptions, 'ssh', sshArgs);
  await run(command, args, env);
}

async function rsync(rsyncOptions, sources, remotePath) {
  const rsyncArgs = ['-a', '-e', buildSshCommandString(rsyncOptions)];
  for (const src of sources) rsyncArgs.push(src);
  rsyncArgs.push(
    `${rsyncOptions.username}@${rsyncOptions.host}:${remotePath}/`
  );
  const { command, args, env } = wrapWithSshpass(
    rsyncOptions,
    'rsync',
    rsyncArgs
  );
  await run(command, args, env);
}

async function upload(dir, rsyncOptions, prefix) {
  const target = path.join(rsyncOptions.destinationPath, prefix);
  try {
    await ensureRemoteDir(rsyncOptions, target);
    const sourceWithTrailingSlash = dir.endsWith('/') ? dir : dir + '/';
    await rsync(rsyncOptions, [sourceWithTrailingSlash], target);
  } catch (error) {
    log.error(`Error uploading dir ` + error);
    throw error;
  }
}

async function uploadFiles(files, rsyncOptions, prefix) {
  const target = path.join(rsyncOptions.destinationPath, prefix);
  try {
    await ensureRemoteDir(rsyncOptions, target);
    if (files.length > 0) {
      await rsync(rsyncOptions, files, target);
    }
  } catch (error) {
    log.error(`Error uploading files ` + error);
    throw error;
  }
}

async function uploadLatestFiles(dir, rsyncOptions, prefix) {
  const files = await recursiveReaddir(dir, true);

  return uploadFiles(files, rsyncOptions, prefix);
}

export default class RsyncPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'rsync', options, context, queue });
  }
  open(context, options) {
    this.rsyncOptions = options.rsync;
    this.options = options;
    this.make = context.messageMaker('rsync').make;
    throwIfMissing(
      this.rsyncOptions,
      ['host', 'destinationPath', 'username'],
      'rsync'
    );
    if (this.rsyncOptions.passphrase) {
      log.warn(
        'rsync.passphrase is set but the rsync plugin cannot supply it non-interactively; load the key into ssh-agent before running sitespeed.io.'
      );
    }
    this.storageManager = context.storageManager;
  }
  async processMessage(message, queue) {
    if (message.type === 'sitespeedio.setup') {
      // Let other plugins know that the rsync plugin is alive
      queue.postMessage(this.make('rsync.setup'));
    } else if (message.type === 'html.finished') {
      const make = this.make;
      const baseDir = this.storageManager.getBaseDir();

      log.info(`Uploading ${baseDir} using rsync, this can take a while ...`);

      try {
        await upload(
          baseDir,
          this.rsyncOptions,
          this.storageManager.getStoragePrefix()
        );
        if (this.options.copyLatestFilesToBase) {
          const rootPath = path.resolve(baseDir, '..');
          const prefix = this.storageManager.getStoragePrefix();
          const firstPart = prefix.split('/')[0];
          await uploadLatestFiles(rootPath, this.rsyncOptions, firstPart);
        }
        log.info('Finished upload using rsync');
        if (this.rsyncOptions.removeLocalResult) {
          fs.rmSync(baseDir, { recursive: true });
          log.debug(`Removed local files and directory ${baseDir}`);
        }
      } catch (error) {
        queue.postMessage(make('error', error));
        log.error('Could not upload using rsync', error);
      }
      queue.postMessage(make('rsync.finished'));
    }
  }
}
