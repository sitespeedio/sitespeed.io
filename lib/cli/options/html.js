import { config as htmlConfig } from '../../plugins/html/index.js';

export function addOptions(yargs) {
  yargs
    .option('html.showAllWaterfallSummary', {
      describe:
        'Set to true to show all waterfalls on page summary HTML report',
      default: false,
      type: 'boolean',
      group: 'HTML'
    })
    .option('html.fetchHARFiles', {
      describe:
        'Set to true to load HAR files using fetch instead of including them in the HTML. Turn this on if serve your pages using a server.',
      default: false,
      type: 'boolean',
      group: 'HTML'
    })
    .option('html.logDownloadLink', {
      describe:
        "Adds a link in the HTML so you easily can download the logs from the sitespeed.io run. If your server is public, be careful so you don't log passwords etc",
      default: false,
      type: 'boolean',
      group: 'HTML'
    })
    .option('html.topListSize', {
      describe:
        'Maximum number of assets to include in each toplist in the toplist tab',
      default: 10,
      group: 'HTML'
    })
    .option('html.showScript', {
      describe:
        'Show a link to the script you use to run. Be careful if your result is public and you keep passwords in your script.',
      default: false,
      type: 'boolean',
      group: 'HTML'
    })
    .option('html.assetsBaseURL', {
      describe:
        'The base URL to the server serving the assets of HTML results. In the format of https://result.sitespeed.io. This can be used to reduce size in large setups. If set, disables writing of assets to the output folder.',
      group: 'HTML'
    })
    .option('html.compareURL', {
      alias: 'html.compareUrl',
      describe:
        'Will add a link on the waterfall page, helping you to compare the HAR. The full path to your compare installation. In the format of https://compare.sitespeed.io/',
      group: 'HTML'
    })
    .option('html.pageSummaryMetrics', {
      describe:
        'Select from a list of metrics to be displayed for given URL(s).  Pass on multiple --html.pageSummaryMetrics to add more than one column. This is best used as an array in your config.json file.',
      group: 'HTML',
      default: htmlConfig.html.pageSummaryMetrics
    })
    .option('html.summaryBoxes', {
      describe:
        'Select required summary information to be displayed on result index page.',
      group: 'HTML',
      default: htmlConfig.html.summaryBoxes
    })
    .option('html.summaryBoxesThresholds', {
      describe:
        'Configure the thresholds for red/yellow/green for the summary boxes.',
      group: 'HTML'
    })
    .option('html.darkMode', {
      alias: ['darkMode'],
      describe: 'View test results with a dark theme.',
      default: false,
      type: 'boolean'
    })
    .option('html.homeurl', {
      default: 'https://www.sitespeed.io/',
      describe: 'The URL for the logo in the result',
      group: 'HTML'
    });
}
