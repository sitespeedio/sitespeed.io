'use strict';

let yargs = require('yargs'),
  path = require('path'),
  packageInfo = require('../../package'),
  merge = require('lodash.merge'),
  reduce = require('lodash.reduce'),
  fs = require('fs'),
  set = require('lodash.set');


function getBrowsertimeOptions(opts) {
  if (!opts) return {};
  let removeOptions = ['output', 'silent', 'har', 'skipHar', 'resultDir', 'config'];
  removeOptions.forEach(p => delete opts['browsertime.' + p]);
  return opts;
}

module.exports.parseCommandLine = function parseCommandLine(opts) {
  let parsed = yargs
    .usage('$0 [options] <url>/<file>')
    .require(1, 'urlOrFile')
    .version(() => `${packageInfo.name} ${packageInfo.version}`)
    .option('debug', {
      default: false,
      describe: 'Debug mode logs all internal messages to the console.',
      type: 'boolean'
    })
    .option('verbose', {
      alias: 'v',
      describe: 'Verbose mode prints progress messages to the console. Enter up to three times (-vvv)' +
        ' to increase the level of detail.',
      type: 'count'
    })
    /*
     Browsertime options
     */
    .options(getBrowsertimeOptions(opts))
    .alias('browsertime.browser', 'browser')
    .alias('browsertime.preScript', 'preScript')
    .alias('browsertime.script', 'script')
    .alias('browsertime.postScript', 'postScript')
    .alias('browsertime.connectivity.profile', 'connectivity')
    .default('browsertime.viewPort', '1366x708')
    /*
     Crawler options
     */
  .option('crawler.depth', {
      alias: 'd',
      describe: 'How deep to crawl (1=only one page, 2=include links from first page, etc.)',
      group: 'Crawler'
    })
    .option('crawler.maxPages', {
      alias: 'm',
      describe: 'The max number of pages to test. Default is no limit.',
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
      default: 'sitespeed_io.default',
      describe: 'The namespace key added to all captured metrics.',
      group: 'Graphite'
    })
    .option('graphite.includeQueryParams', {
      default: false,
      describe: 'Whether to include query paramaters from the URL in the Graphite keys or not',
      type: 'boolean',
      group: 'Graphite'
    })
    /** PLugins */
    .option('plugins.list', {
      default: false,
      describe: 'List all configured plugins in the log.',
      type: 'boolean',
      group: 'Plugins'
    })
    .option('plugins.disable', {
      type: 'array',
      describe: 'Disable a plugin. Use it to disable generating html or screenshots.',
      group: 'Plugins'
    })
    .option('plugins.load', {
      type: 'array',
      describe: 'Extra plugins that you want to run. Relative or absolute path to the plugin.',
      group: 'Plugins'
    })
    /**
     InfluxDB cli option
     */
    /*
     // Hide this until it's ready to release
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
    */

    .option('metrics.list', {
      describe: 'List all possible metrics in the data folder (metrics.txt).',
      type: 'boolean',
      default: false,
      group: 'Metrics'
    })
    .option('metrics.filterList', {
      describe: 'List all configured filters for metrics in the data folder (configuredMetrics.txt)',
      type: 'boolean',
      default: false,
      group: 'Metrics'
    })
    .option('metrics.filter', {
      type: 'array',
      describe: 'Add/change/remove filters for metrics. If you want to send all metrics, use: *+ . If you want to remove all current metrics and send only the coach score: *- coach.summary.score.*',
      group: 'Metrics'
    })

  /*
   WebPageTest cli options
   */
  .option('webpagetest.host', {
      default: 'https://www.webpagetest.org',
      describe: 'The domain of your WebPageTest instance.',
      group: 'WebPageTest'
    })
    .option('webpagetest.key', {
      describe: 'The API key for you WebPageTest instance.',
      group: 'WebPageTest'
    })
    .option('webpagetest.location', {
      describe: 'The location for the test',
      default: 'Dulles:Chrome',
      group: 'WebPageTest'
    })
    .option('webpagetest.connectivity', {
      describe: 'The connectivity for the test.',
      default: 'Cable',
      group: 'WebPageTest'
    })
    .option('webpagetest.runs', {
      describe: 'The number of runs per URL.',
      default: 3,
      group: 'WebPageTest'
    })
    .option('webpagetest.custom', {
      describe: 'Execute arbitrary Javascript at the end of a test to collect custom metrics.',
      group: 'WebPageTest'
    })
    .option('webpagetest.script', {
      describe: 'Path to a script file',
      group: 'WebPageTest'
    })
    /** Google Page Speed Insights */
    .option('gpsi.key', {
      describe: 'The key to use Google Page Speed Insight',
      group: 'gpsi'
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
  /*
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
  .option('html.showAllWaterfallSummary', {
      describe: 'Set to true to show all waterfalls on page summary HTML report',
      default: false,
      type: 'boolean',
      group: 'HTML'
    })
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
  .option('summary', {
    describe: 'Show brief text summary to stdout',
    default: false,
    type: 'boolean',
    group: 'TEXT'
  })
  .option('summary-detail', {
    describe: 'Show longer text summary to stdout',
    default: false,
    type: 'boolean',
    group: 'TEXT'
  })
  .option('mobile', {
      describe: 'Access pages as mobile a fake mobile device. Set UA and width/height. For Chrome it will use device Apple iPhone 6.',
      default: false,
      type: 'boolean'
    })
    /*
    // Hide this until we de decide how to implement it
    .option('postTasks', {
      describe: 'Where you have your extra post tasks that will run after all analyze steps are finished NOT YET IMPLEMENTED'
    })
    .option('postTasksPerURL', {
      describe: 'Where you have your extra post tasks that will run after each URL is analyzed NOT YET IMPLEMENTED'
    })
    */
    .option('outputFolder', {
      describe: 'The folder where the result will be stored.'
    })
    .option('firstParty', {
      describe: 'A regex running against each request and categorize it as first vs third party URL. (ex: ".*sitespeed.*")'
    })
    .option('utc', {
      describe: 'Use Coordinated Universal Time for timestamps',
      default: false,
      type: 'boolean'
    })
    .help('h')
    .alias('help', 'h')
    .config('config')
    .alias('version', 'V')
    //     .describe('browser', 'Specify browser')
    .wrap(yargs.terminalWidth())
    //  .check(validateInput)
    .epilog('Read the docs at https://www.sitespeed.io/documentation/');

  const aliases = parsed.getOptions().alias,
    argv = parsed.argv;

  // aliases are long options -> short option
  const aliasLookup = reduce(aliases, (lookup, value, key) => {
    lookup.set(value[0], key);
    return lookup;
  }, new Map());

  let explicitOptions = yargs.reset().argv;

  explicitOptions = reduce(explicitOptions, (result, value, key) => {
    if (aliasLookup.has(key)) {
      const fullKey = aliasLookup.get(key);
      result = set(result, fullKey, value);
    }
    result = set(result, key, value);
    return result;
  }, {});

  if (argv.config) {
    const config = require(path.resolve(process.cwd(), argv.config));
    explicitOptions = merge(explicitOptions, config);
  }

  if (argv.webpagetest.custom) {
    argv.webpagetest.custom = fs.readFileSync(path.resolve(argv.webpagetest.custom), { encoding:'utf8' });
  }
  if (argv.webpagetest.script) {
    argv.webpagetest.script= fs.readFileSync(path.resolve(argv.webpagetest.script), { encoding:'utf8' });
  }
  if (argv.summaryDetail) argv.summary = true;

  return {
    url: argv._[0],
    options: argv,
    explicitOptions: explicitOptions
  };
};
