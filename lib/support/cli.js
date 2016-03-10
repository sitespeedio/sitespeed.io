'use strict';

let yargs = require('yargs'),
  merge = require('lodash.merge'),
  packageInfo = require('../../package');

module.exports.parseCommandLine = function parseCommandLine() {
  let argv = yargs
    .usage('$0 [options] <url>/<file>')
    .require(1, 'urlOrFile')
    .version(() => `${packageInfo.name} ${packageInfo.version}`)
    .count('verbose')
    .option('debug', {
      default: false,
      describe: 'Debug mode logs all internal messages to the console.',
      type: 'boolean'
    })
    /*
     Browsertime cli options
     */
    .option('b', {
      alias: 'browsertime.browser',
      default: 'firefox',
      describe: 'Choose which Browser to use when you test [firefox|chrome]',
      choices: ['chrome', 'firefox'],
      group: 'Browser'
    })
    .option('n', {
      alias: 'browsertime.iterations',
      default: 3,
      describe: 'How many times you want to test each page',
      group: 'Browser'
    })
    .option('browsertime.delay', {
      describe: 'Delay between runs, in milliseconds',
      group: 'Browser'
    })
    .option('browsertime.connection', {
      describe: 'Limit the connectivity speed by simulating connection types',
      choices: ['mobile3g', 'mobile3gfast', 'cable', 'native'],
      group: 'Browser'
    })
/*    .option('browsertime.waitScript', {
      describe: 'Supply javascript that decides when a browser run is finished. Use it to fetch timings happening after the loadEventEnd',
      group: 'Browser'
    })
    .option('browsertime.customScripts', {
      describe: 'The path to an extra script folder with scripts that will be executed in the browser. See https://www.sitespeed.io/documentation/browsers/#custom-metrics',
      group: 'Browser'
    })
*/
    .option('browsertime.seleniumServer', {
      describe: 'Configure the path to the Selenium server when fetching timings using browsers. If not configured the supplied NodeJS/Selenium version is used.',
      group: 'Browser'
    })
    .option('browsertime.viewPort', {
      default: '1280x800',
      describe: 'The view port, the page viewport size WidthxHeight like 400x300',
      group: 'Browser'
    })
    .option('browsertime.userAgent', {
      describe: 'The full User Agent string, defaults to the user agent used by the browsertime.browser option.',
      group: 'Browser'
    })
    .option('browsertime.preTask', {
      describe: 'Path to JS file for any preTasks that need to be executed.',
      group: 'Browser'
    })
    .option('browsertime.postTask', {
      describe: 'Path to JS file for any postTasks that need to be executed.',
      group: 'Browser'
    })

    /*
     Crawler options
     */
    .option('d', {
      alias: 'crawler.depth',
      default: 1,
      describe: 'How deep to crawl. NOT YET IMPLEMENTED',
      group: 'Crawler'
    })
    .option('m', {
      alias: 'crawler.maxPagesToTest',
      describe: 'The max number of pages to test. Default is no limit. NOT YET IMPLEMENTED',
      group: 'Crawler'
    })
    .option('s', {
      alias: 'crawler.skip',
      describe: 'Do not crawl pages that contains this value in the URL path. NOT YET IMPLEMENTED',
      group: 'Crawler'
    })
    .option('c', {
      alias: 'crawler.containInPath',
      describe: 'Only crawl URLs that contains this value in the URL path. NOT YET IMPLEMENTED',
      group: 'Crawler'
    })
    /**
     Graphite cli option
     */
    .option('graphite.host', {
      describe: 'The Graphite host used to store captured metrics.',
      group: 'Graphite'
    })
    .option('graphite.port', {
      default: 2003,
      describe: 'The Graphite port used to store captured metrics.',
      group: 'Graphite'
    })
    .option('graphite.namespace', {
      default: 'sitespeed_io',
      describe: 'The namespace key added to all captured metrics.',
      group: 'Graphite'
    })
    .option('graphite.includeQueryParams', {
      default: false,
      describe: 'Whether to include query paramaters from the URL in the Graphite keys or not',
      type: 'boolean',
      group: 'Graphite'
    })
    .option('graphite.data', {
      describe: 'Path to a JSON file to customize which metrics to send. NOT YET IMPLEMENTED',
      group: 'Graphite'
    })
    /**
     InfluxDB cli option
     */
    .option('influxdb.host', {
      describe: 'The InflxDB host used to store captured metrics.',
      group: 'InfluxDB'
    })
    .option('influxdb.port', {
      default: 8086,
      describe: 'The InfluxDB port used to store captured metrics.',
      group: 'InfluxDB'
    })
    .option('influxdb.username', {
      describe: 'The InfluxDB username for your InfluxDB instance.',
      group: 'InfluxDB'
    })
    .option('influxdb.password', {
      describe: 'The InfluxDB password for your InfluxDB instance.',
      group: 'InfluxDB'
    })
    .option('influxdb.database', {
      default: 'sitespeed',
      describe: 'The database name used to store captured metrics.',
      group: 'InfluxDB'
    })
    .option('influxdb.data', {
      describe: 'Path to a JSON file to customize which metrics to send. NOT YET IMPLEMENTED',
      group: 'InfluxDB'
    })


    /*
     WebPageTest cli options
     */
    .option('webpagetest.host', {
      default: 'www.webpagetest.org',
      describe: 'The domain of your WebPageTest instance.',
      group: 'WebPageTest'
    })
    .option('webpagetest.key', {
      describe: 'The API key for you WebPageTest instance.',
      group: 'WebPageTest'
    })
    /**
     Slack options
     */
    .option('slack.hookUrl', {
      describe: 'WebHook url for the Slack team (check https://<your team>.slack.com/apps/manage/custom-integrations).',
      group: 'Slack'
    })
    .option('slack.userName', {
      describe: 'User name to use when posting status to Slack.',
      default: 'Sitespeed.io',
      group: 'Slack'
    })

    /*
     Web Performance budget configuration
     */
    .option('budget', {
      describe: 'A file/JSON containing the web perf budget rules. Check ' +
      'https://www.sitespeed.io/documentation/performance-budget/ NOT YET IMPLEMENTED',
      group: 'Budget'
    })
    .option('budget.tap', {
      describe: 'Generate the budget result as TAP. NOT YET IMPLEMENTED',
      type: 'boolean',
      default: false,
      group: 'Budget'

    })
    .option('budget.junit', {
      describe: 'Generate the budget result as JUnit. NOT YET IMPLEMENTED',
      type: 'boolean',
      default: false,
      group: 'Budget'
    })
    /**
     Html options
     */
/*
    .option('html.generateHTML', {
      describe: 'Generate HTML results. You may skip it when you store the data elsewhere.',
      type: 'boolean',
      default: true,
      group: 'HTML'
    })
    .option('html.summaryBoxes', {
      describe: 'The boxes showed on site summary page, see  https://www.sitespeed.io/documentation/configuration/#configure-boxes-on-summary-page',
      group: 'HTML'
    })
    .option('html.pagesColumns', {
      describe: 'The columns showed on detailed page summary table, see https://www.sitespeed.io/documentation/configuration/#configure-columns-on-pages-page',
      group: 'HTML'
    })
    .option('html.name', {
      describe: ' Give your test a name, it will be added to all HTML pages',
      group: 'HTML'
    })
*/

    .option('profile', {
      describe: 'Choose between testing for desktop or mobile.' +
      'Testing for desktop will use desktop rules & user agents and vice versa. NOT YET IMPLEMENTED',
      default: 'desktop',
      choices: ['desktop', 'mobile']
    })
    .option('postTasks', {
      describe: 'Where you have your extra post tasks that will run after all analyze steps are finished'
    })
    .option('postTasksPerURL', {
      describe: 'Where you have your extra post tasks that will run after each URL is analyzed'
    })
    .option('outputFolder', {
      describe: 'The folder name where the result will be stored. By default the name is generated using current_date/domain/filename'
    })
    .help('h')
    .alias('h', 'help')
    .config('config')
    .alias('v', 'verbose')
    .alias('V', 'version')
    //     .describe('browser', 'Specify browser')
    .wrap(yargs.terminalWidth())
    //  .check(validateInput)
    .epilog('Read the docs at https://www.sitespeed.io')
    .argv;

    // TODO: Remove this hack when yargs supports merging nested objects when
    // both a json file is passed and the key is passed via an option
    let rawArgv = yargs.reset().argv;
    if(argv.webpagetest && argv.config) {
      rawArgv = merge({}, {"webpagetest": argv.webpagetest}, rawArgv);
    }
    // End hack

  return {
    url: argv._[0],
    options: argv,
    raw: rawArgv
  };
};
