import { importGlobalSilent } from 'import-global';

/**
 * Dynamically load and register CLI options from plugins.
 *
 * @param {import('yargs').Argv} yargsInstance - The yargs instance to extend.
 * @param {string[]} plugins - Array of plugin module names.
 * @returns {Promise<void>}
 */
export async function registerPluginOptions(yargsInstance, plugins) {
  for (const pluginName of plugins) {
    try {
      // Dynamically import the plugin
      let plugin = await importGlobalSilent(pluginName);
      // If the plugin exports a function to get CLI options, merge them
      if (
        plugin &&
        plugin.default &&
        typeof plugin.default.getCliOptions === 'function'
      ) {
        const options = plugin.default.getCliOptions();
        yargsInstance.options(options);
      } else {
        try {
          const plugin = await import(pluginName);
          if (
            plugin &&
            plugin.default &&
            typeof plugin.default.getCliOptions === 'function'
          ) {
            const options = plugin.default.getCliOptions();
            yargsInstance.options(options);
          }
        } catch {
          // Swallow this silent
        }
      }
    } catch {
      // Swallow this silent
    }
  }
}
