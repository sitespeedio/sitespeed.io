/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var fs = require('fs-extra'),
  defaultConfig = require('../conf/defaultConfig'),
  EOL = require('os').EOL,
  h = require('nomnom').help(
    'sitespeed.io is a tool that helps you analyze your website performance and show you what you should optimize, more info at http://www.sitespeed.io.' +
    EOL +
    'To collect timings in Chrome you need to install the ChromeDriver. Firefox works out of the box. Example:' + EOL +
    '$ sitespeed.io -u http://www.sitespeed.io -b chrome,firefox'
  ),
  cli = require('nomnom').options({
    url: {
      abbr: 'u',
      metavar: '<URL>',
      help: 'The start url'
    },
    file: {
      abbr: 'f',
      metavar: '<FILE>',
      help: 'The path to a plain text file with one URL on each row.',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          return 'Could not find the file:' + file;
        }
      }
    },
    sites: {
      metavar: '<FILE>',
      help: 'The path to a plain text file with one URL on each row.',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          return 'Couldnt find the file:' + file;
        }
      }
    },
    version: {
      flag: true,
      abbr: 'v',
      help: 'Display the sitespeed.io version.',
      callback: function() {
        return require('../package.json').version;
      }
    },
    deep: {
      abbr: 'd',
      metavar: '<INTEGER>',
      default: defaultConfig.deep,
      help: 'How deep to crawl.',
      callback: function(deep) {
        if (deep != parseInt(deep)) { // jshint ignore:line
          return 'You must specify an integer of how deep you want to crawl';
        }
      }
    },
    containInPath: {
      abbr: 'c',
      metavar: '<KEYWORD>',
      help: 'Only crawl URLs that contains this in the path.'
    },
    skip: {
      abbr: 's',
      metavar: '<KEYWORD>',
      help: 'Do not crawl pages that contains this in the path.'
    },
    threads: {
      abbr: 't',
      metavar: '<NOOFTHREADS>',
      default: defaultConfig.threads,
      help: 'The number of threads/processes that will analyze pages.',
      callback: function(threads) {
        if (threads != parseInt(threads)) { // jshint ignore:line
          return 'You must specify an integer of how many processes/threads that will analyze your page';
        } else if (parseInt(threads) <= 0) {
          return 'You must specify a positive integer';
        }
      }
    },
    name: {
      metavar: '<NAME>',
      help: 'Give your test a name, it will be added to all HTML pages.'
    },
    memory: {
      metavar: '<INTEGER>',
      default: defaultConfig.memory,
      help: 'How much memory the Java processed will have (in mb).'
    },
    resultBaseDir: {
      abbr: 'r',
      metavar: '<DIR>',
      default: defaultConfig.resultBaseDir,
      help: 'The result base directory, this is the base dir where the result(s) will end up.',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          fs.mkdirs(file, function(err) {
            if (err) {
              return 'Couldnt create the result base dir:' + err;
            }
          });
        }
      }
    },
    outputFolderName: {
      help: 'By default the folder name will be the date when you run the test like yyyy-mm-dd-HH-MM-ss.'
    },
    userAgent: {
      metavar: '<USER-AGENT>',
      default: defaultConfig.userAgent,
      help: 'The full User Agent string, default is Chrome for MacOSX. You can also set the value as iphone or ipad (will automagically change the viewport)'
    },
    viewPort: {
      metavar: '<WidthxHeight>',
      default: defaultConfig.viewPort,
      help: 'The view port, the page viewport size WidthxHeight, like 400x300.'
    },
    yslow: {
      abbr: 'y',
      metavar: '<FILE>',
      default: defaultConfig.yslow,
      help: 'The compiled YSlow file.',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          return 'Couldnt find the file:' + fs.realpathSync(file);
        }
      }
    },
    ruleSet: {
      metavar: '<RULE-SET>',
      default: defaultConfig.ruleSet,
      help: 'Which ruleset to use.'
    },
    limitFile: {
      metavar: '<PATH>',
      default: defaultConfig.limitFile,
      help: 'The path to the limit configuration file.'
    },
    basicAuth: {
      metavar: '<USERNAME:PASSWORD>',
      help: 'Basic auth user & password.'
    },
    browser: {
      abbr: 'b',
      metavar: '<BROWSER>',
      help: 'Choose which browser to use to collect timing data. You can set multiple browsers in a comma separated list (firefox|chrome|phantomjs)',
      callback: function(browsers) {
        var b = browsers.split(','),
          invalidBrowsers = b.filter(function(browser) {
            return defaultConfig.supportedBrowsers.indexOf(browser.toLowerCase()) < 0;
          });

        if (invalidBrowsers.length > 0) {
          return 'You specified a browser that is not supported:' + invalidBrowsers;
        }
      }
    },
    profile: {
      metavar: '<desktop|mobile>',
      choices: ['desktop', 'mobile'],
      default: defaultConfig.profile,
      help: 'Choose between testing for desktop or mobile. Testing for desktop will use desktop rules & user agents, and vice verca.'
    },
    no: {
      abbr: 'n',
      metavar: '<NUMBEROFTIMES>',
      default: defaultConfig.no,
      help: 'The number of times you should test each URL when fetching timing metrics. Default is ' + defaultConfig.no +
        ' times',
      callback: function(n) {
        if (n != parseInt(n)) { // jshint ignore:line
          return 'You must specify an integer of how many times you want to test one URL';
        } else if (parseInt(n) <= 0) {
          return 'You must specify a positive integer of how many times you want to test one URL';
        }
      }
    },
    screenshot: {
      flag: true,
      help: 'Take screenshots for each page (using the configured view port).'
    },
    junit: {
      flag: true,
      help: 'Create JUnit output to the console.'
    },
    tap: {
      flag: true,
      help: 'Create TAP output to the console.'
    },
    skipTest: {
      metavar: '<ruleid1,ruleid2,...>',
      help: 'A comma separeted list of rules to skip when generating JUnit/TAP output.'
    },
    testData: {
      default: defaultConfig.testData,
      help: 'Choose which data to send test when generating TAP/JUnit output. Default all availible data is tested. [rules,timings,wpt,gpsi]'
    },
    thresholdFile: {
      metavar: '<FILE>',
      help: 'A file containing JSON like  {\'overall\': 90, \'thirdpartyversions\': 85}'
    },
    maxPagesToTest: {
      abbr: 'm',
      metavar: '<NUMBEROFPAGES>',
      help: 'The max number of pages to test. Default is no limit.'
    },
    proxy: {
      abbr: 'p',
      metavar: '<PROXY>',
      help: 'http://proxy.soulgalore.com:80'
    },
    cdns: {
      metavar: '<cdn1,cdn2>',
      list: true,
      help: 'A comma separated list of additional CDNs.'
    },
    boxes: {
      metavar: '<box1,box2>',
      list: true,
      help: 'The boxes showed on site summary page, see http://www.sitespeed.io/documentation/#config-boxes'
    },
    columns: {
      abbr: 'c',
      metavar: '<column1,column2>',
      list: true,
      help: 'The columns showed on detailed page summary table, see http://www.sitespeed.io/documentation/#config-columns'
    },
    configFile: {
      metavar: '<PATH>',
      help: 'The path to a sitespeed.io config.json file, if it exists all other input parameters will be overidden.'
    },
    // TODO How to override existing
    aggregators: {
      metavar: '<PATH>',
      help: 'The path to a directory with extra aggregators.'
    },
    // TODO maybe collectors are overkill
    collectors: {
      metavar: '<PATH>',
      help: 'The path to a directory with extra collectors.'
    },
    graphiteHost: {
      metavar: '<HOST>',
      help: 'The Graphite host.'
    },
    graphitePort: {
      metavar: '<INTEGER>',
      default: defaultConfig.graphitePort,
      help: 'The Graphite port.'
    },
    graphiteNamespace: {
      metavar: '<NAMESPACE>',
      default: defaultConfig.graphiteNamespace,
      help: 'The namespace of the data sent to Graphite.'
    },
    graphiteData: {
      default: defaultConfig.graphiteData,
      help: 'Choose which data to send to Graphite by a comma separated list. Default all data is sent. [summary,rules,pagemetrics,timings]'
    },
    gpsiKey: {
      help: 'Your Google API Key, configure it to also fetch data from Google Page Speed Insights.'
    },
    noYslow: {
      flag: true,
      help: 'Set to true to turn of collecting metrics using YSlow.',
    },
    wptLocation: {
      metavar: '<STRING>',
      help: 'WebPageTest location, something like Dulles:Chrome ',
    },
    wptUrl: {
      metavar: '<URL>',
      help: 'The URL to your private webpagetest instance.'
    },
    wptKey: {
      metavar: '<KEY>',
      help: 'The API key if running on webpagetest on the public instances.'
    },
    requestHeaders: {
      metavar: '<JSON>',
      help: 'Any request headers to use, in the JSON form of {\"name\":\"value\",\"name\":\"value\"}. Not supported for WPT & GPSI.'
    }
  }).parse();

if ((!cli.url) && (!cli.file) && (!cli.sites)) {
  console.log('You must specify either a URL to test or a file with URL:s');
  console.log(require('nomnom').getUsage());
  process.exit(1);
}

module.exports = cli;