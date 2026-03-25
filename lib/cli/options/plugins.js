export function addOptions(yargs) {
  yargs
    .option('plugins.list', {
      describe: 'List all configured plugins in the log.',
      type: 'boolean',
      group: 'Plugins'
    })
    .option('plugins.disable', {
      type: 'array',
      describe: false
    })
    .option('plugins.load', {
      type: 'array',
      describe: false
    })
    .option('plugins.add', {
      describe:
        'Extra plugins that you want to run. Relative or absolute path to the plugin. ' +
        'Specify multiple plugin names separated by comma, or repeat the --plugins.add option',
      group: 'Plugins'
    })
    .option('plugins.remove', {
      describe:
        'Default plugins that you not want to run. ' +
        'Specify multiple plugin names separated by comma, or repeat the --plugins.remove option',
      group: 'Plugins'
    })
    .coerce('plugins', plugins => {
      if (plugins) {
        if (plugins.add && !Array.isArray(plugins.add)) {
          plugins.add = plugins.add.split(',');
        }
        if (plugins.remove && !Array.isArray(plugins.remove)) {
          plugins.remove = plugins.remove.split(',');
        }
        return plugins;
      }
    });
}
