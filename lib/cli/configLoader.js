import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { findUpSync } from '../support/fileUtil.js';

const require = createRequire(import.meta.url);
export const version = require('../../package.json').version;

const configFiles = ['.sitespeed.io.json'];

const addedPlugins = yargs(hideBin(process.argv))
  .option('plugins.add', { type: 'array' })
  .help(false)
  .version(false)
  .parse();
export const globalPluginsToAdd = addedPlugins.plugins?.add || [];

if (process.argv.includes('--config')) {
  const index = process.argv.indexOf('--config');
  configFiles.unshift(process.argv[index + 1]);
}

const configPath = findUpSync(configFiles);
let config;

try {
  config = configPath ? JSON.parse(readFileSync(configPath)) : undefined;
  if (config && process.argv.includes('--ignoreExtends')) {
    delete config.extends;
  }
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error(
      'Error: Could not parse the config JSON file ' +
        configPath +
        '. Is the file really valid JSON?'
    );
  }
  throw error;
}

export { config };
