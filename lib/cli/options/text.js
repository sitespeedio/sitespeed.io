export function addOptions(yargs) {
  yargs
    .option('summary', {
      describe: 'Show brief text summary to stdout',
      default: false,
      type: 'boolean',
      group: 'Text'
    })
    .option('summaryDetail', {
      describe: 'Show longer text summary to stdout',
      default: false,
      type: 'boolean',
      group: 'Text'
    });
}
