export function addOptions(yargs) {
  yargs
    .option('sustainable.enable', {
      type: 'boolean',
      describe: 'Test if the web page is sustainable.',
      group: 'Sustainable'
    })
    .option('sustainable.model', {
      describe: 'Model used for measure digital carbon emissions.',
      default: '1byte',
      choices: ['1byte', 'swd'],
      group: 'Sustainable'
    })
    .option('sustainable.modelVersion', {
      describe:
        'The version used for the model. Only applicable for model swd at the moment.',
      default: 3,
      choices: [3, 4],
      group: 'Sustainable'
    })
    .option('sustainable.pageViews', {
      describe: 'Number of page views used when calculating CO2.',
      group: 'Sustainable'
    })
    .option('sustainable.disableHosting', {
      type: 'boolean',
      default: false,
      describe:
        'Disable the hosting check. Default we do a check to a local database of domains with green hosting provided by the Green Web Foundation',
      group: 'Sustainable'
    })
    .option('sustainable.useGreenWebHostingAPI', {
      type: 'boolean',
      default: false,
      describe:
        'Instead of using the local copy of the hosting database, you can use the latest version through the Green Web Foundation API. This means sitespeed.io will make HTTP GET to the the hosting info.',
      group: 'Sustainable'
    });
}
