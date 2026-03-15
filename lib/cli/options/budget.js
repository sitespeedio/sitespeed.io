import { readFileSync } from 'node:fs';

export function addOptions(yargs) {
  yargs
    .option('budget.configPath', {
      describe: 'Path to the JSON budget file.',
      group: 'Budget'
    })
    .option('budget.suppressExitCode', {
      describe:
        'By default sitespeed.io returns a failure exit code, if the budget fails. Set this to true and sitespeed.io will return exit code 0 independent of the budget.',
      group: 'Budget'
    })
    .option('budget.config', {
      describe: 'The JSON budget config as a string.',
      group: 'Budget'
    })
    .option('budget.output', {
      choices: ['junit', 'tap', 'json'],
      describe: 'The output format of the budget.',
      group: 'Budget'
    })
    .option('budget.friendlyName', {
      describe:
        'Add a friendly name to the test case. At the moment this is only used in junit.',
      group: 'Budget'
    })
    .option('budget.removeWorkingResult', {
      alias: 'budget.removePassingResult',
      type: 'boolean',
      describe:
        'Remove the result of URLs that pass the budget. You can use this if you many URL and only care about the ones that fails your budget. All videos/HTML for the working URLs will be removed if you pass this on.',
      group: 'Budget'
    })
    .coerce('budget', function (argument) {
      if (argument) {
        if (typeof argument === 'object' && !Array.isArray(argument)) {
          if (argument.configPath) {
            argument.config = JSON.parse(
              readFileSync(argument.configPath, 'utf8')
            );
          } else if (argument.config) {
            argument.config = JSON.parse(argument.config);
          }
          return argument;
        } else {
          throw new TypeError(
            '[ERROR] Something looks wrong with your budget configuration. Since sitespeed.io 4.4 you should pass the path to your budget file through the --budget.configPath flag instead of directly through the --budget flag.'
          );
        }
      }
    });
}
