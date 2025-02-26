import path from 'node:path';
import { readdir as _readdir } from 'node:fs';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { importGlobalSilent } from 'import-global';
const readdir = promisify(_readdir);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultPlugins = new Set([
  'browsertime',
  'coach',
  'pagexray',
  'domains',
  'assets',
  'html',
  'metrics',
  'text',
  'harstorer',
  'budget',
  'thirdparty',
  'tracestorer',
  'lateststorer',
  'remove'
]);

const pluginsDir = path.join(__dirname, '..', 'plugins');

export async function parsePluginNames(options) {
  // There's a problem with Safari on iOS runninhg a big blob
  // of JavaScript
  // https://github.com/sitespeedio/browsertime/issues/1275
  if (options.safari && options.safari.ios) {
    defaultPlugins.delete('coach');
  }

  // if we don't use the cli, this will work out fine as long
  // we configure only what we need
  const possibleConfiguredPlugins = options.explicitOptions || options;
  const isDefaultOrConfigured = name =>
    defaultPlugins.has(name) ||
    typeof possibleConfiguredPlugins[name] === 'object';

  const addMessageLoggerIfDebug = pluginNames => {
    if (options.debugMessages) {
      // Need to make sure logger is first, so message logs appear
      // before messages are handled by other plugins
      pluginNames = ['messagelogger'].concat(pluginNames);
    }
    return pluginNames;
  };

  const files = await readdir(pluginsDir);

  const builtins = files.map(name => path.basename(name, '.js'));
  // eslint-disable-next-line unicorn/no-array-callback-reference
  const plugins = builtins.filter(isDefaultOrConfigured);
  return addMessageLoggerIfDebug(plugins);
}
export async function loadPlugins(pluginNames, options, context, queue) {
  const plugins = [];
  for (let name of pluginNames) {
    try {
      const pluginPath = path.join(pluginsDir, name, 'index.js');
      const pluginUrl = pathToFileURL(pluginPath).href;
      let { default: plugin } = await import(pluginUrl);
      let p = new plugin(options, context, queue);
      plugins.push(p);
    } catch (error_) {
      try {
        let { default: plugin } = await import(
          path.resolve(process.cwd(), name)
        );
        let p = new plugin(options, context, queue);
        plugins.push(p);
      } catch {
        try {
          let { default: plugin } = await import(name);
          let p = new plugin(options, context, queue);
          plugins.push(p);
        } catch (error) {
          // try global
          try {
            let { default: plugin } = await importGlobalSilent(name);
            if (plugin) {
              let p = new plugin(options, context, queue);
              plugins.push(p);
            } else {
              console.error("Couldn't load plugin %s: %s", name, error_);
              // if it fails here, let it fail hard
              throw error;
            }
          } catch {
            console.error("Couldn't find/load plugin %s", name);
            // if it fails here, let it fail hard
            throw error;
          }
        }
      }
    }
  }
  return plugins;
}
