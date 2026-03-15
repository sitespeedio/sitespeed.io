export function addOptions(yargs) {
  yargs
    .option('browsertime.edge.edgedriverPath', {
      alias: 'edge.edgedriverPath',
      describe: 'To run Edge you need to supply the path to the msedgedriver',
      group: 'Edge'
    })
    .option('browsertime.edge.binaryPath', {
      alias: 'edge.binaryPath',
      describe: 'Path to custom Edge binary',
      group: 'Edge'
    });
}
