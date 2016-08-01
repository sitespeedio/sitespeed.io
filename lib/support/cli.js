'use strict';

let yargs = require('yargs'),
  path = require('path'),
  packageInfo = require('../../package'),
  merge = require('lodash.merge'),
  reduce = require('lodash.reduce'),
  fs = require('fs'),
  set = require('lodash.set');

module.exports.parseCommandLine = function parseCommandLine() {
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
     Browsertime cli options
     */
    .option('browsertime.browser', {
      alias: ['b', 'browser'],
      default: 'chrome',
      describe: 'Choose which Browser to use when you test.',
      choices: ['chrome', 'firefox'],
      group: 'Browser'
    })
    .option('browsertime.iterations', {
      alias: 'n',
      default: 3,
      describe: 'How many times you want to test each page',
      group: 'Browser'
    })
    .option('browsertime.delay', {
      describe: 'Delay between runs, in milliseconds',
      group: 'Browser'
    })
    .option('browsertime.connectivity.profile', {
      alias: ['c', 'connectivity'],
      default: 'native',
      choices: ['3g', '3gfast', '3gslow', '2g', 'cable', 'native', 'custom'],
      describe: 'The connectivity profile. Default connectivity engine is tsproxy',
      group: 'Browser'
    })
    .option('browsertime.connectivity.config', {
      default: undefined,
      describe: 'This option requires --connectivity.profile be set to "custom". Takes a JSON object with the keys downstreamKbps, upstreamKbps and latency. \"{\\\"downstreamKbps\\\":6000, \\\"upstreamKbps\\\": 6000, \\\"latency\\\": 200}\"',
      group: 'Browser'
    })

  .option('browsertime.connectivity.engine', {
      default: 'tsproxy',
      choices: ['tc', 'tsproxy'],
      describe: 'The engine for connectivity. Tsproxy needs Python 2.7. TC needs tc, modprobe and ip installed to work. Running tc inside Docker needs modprobe to run outside the container.',
      group: 'Browser'
    })
    .option('browsertime.pageCompleteCheck', {
      describe: 'Supply javascript that decides when a browser run is finished. Use it to fetch timings happening after the loadEventEnd.',
      group: 'Browser'
    })
    /*
    .option('browsertime.script', {
      describe: 'Add custom Javascript to run on page. If a single js file is specified, it will be included in the category named "custom" in the output json. Pass a folder to include all .js scripts in the folder, and have the folder name be the category. Note that --script can be passed multiple times.',
      group: 'Browser'
    })
    */
    .option('browsertime.selenium.url', {
      describe: 'Configure the path to the Selenium server when fetching timings using browsers. If not configured the supplied NodeJS/Selenium version is used.',
      group: 'Browser'
    })
    .option('browsertime.viewPort', {
      default: '1366x708',
      describe: 'The view port, the page viewport size WidthxHeight like 400x300',
      group: 'Browser'
    })
    .option('browsertime.userAgent', {
      describe: 'The full User Agent string, defaults to the user agent used by the browsertime.browser option.',
      group: 'Browser'
    })
    .option('browsertime.preScript', {
      alias: 'preScript',
      describe: 'Task(s) to run before you test your URL (use it for login etc). Note that --preScript can be passed multiple times.',
      group: 'Browser'
    })
    .option('browsertime.postScript', {
      alias: 'postScript',
      describe: 'Path to JS file for any postTasks that need to be executed.',
      group: 'Browser'
    })
    .option('browsertime.delay', {
      type: 'number',
      default: 0,
      describe: 'Delay between runs, in milliseconds'
    })

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
    /*
    .option('plugins.npmLoad', {
      type: 'array',
      describe: 'Extra plugins as an installed npm module that you want to run',
      group: 'Plugins'
    })
    */
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
  .option('html.showWaterfallSummary', {
      describe: 'Set to true to show waterfalls on summary HTML report',
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
      describe: 'The folder name where the result will be stored. By default the name is generated using current_date/domain/filename',
      default: 'sitespeed-result'
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
    .epilog('Read the docs at https://www.sitespeed.io/sitespeed.io/documentation/');

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

  return {
    url: argv._[0],
    options: argv,
    explicitOptions: explicitOptions
  };
};
