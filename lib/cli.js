/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var fs = require('fs-extra'),
  fileHelper = require('./util/fileHelpers'),
  defaultConfig = require('../conf/defaultConfig'),
  EOL = require('os').EOL,
  validUrl = require('valid-url'),
  cli = require('nomnom').help(
    'sitespeed.io is a tool that helps you analyze your website performance and show you what you should optimize, more info at http://www.sitespeed.io.' +
    EOL +
    'To collect timings in Chrome you need to install the ChromeDriver. Firefox works out of the box. Example:' + EOL +
    '$ sitespeed.io -u http://www.sitespeed.io -b chrome,firefox'
  ).options({
    url: {
      abbr: 'u',
      metavar: '<URL>',
      help: 'The start url that will be used when crawling.',
      callback: function(url) {
        if (!validUrl.isWebUri(url)) {
          return 'This is not a valid url (you need to include protocol):' + url;
        }
      }
    },
    file: {
      abbr: 'f',
      metavar: '<FILE>',
      help: 'The path to a plain text file with one URL on each row. Each URL will be analyzed.',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          return 'Could not find the file:' + file;
        }
      }
    },
    sites: {
      metavar: '<FILE>',
      help: 'The path to a plain text file with one URL on each row. Each URL is crawled.',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          return 'Couldnt find the file:' + file;
        }
      }
    },
    version: {
      flag: true,
      abbr: 'V',
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
      help: 'The result base directory, the base dir where the result ends up.',
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
      help: 'Default the folder name is a date of format yyyy-mm-dd-HH-MM-ss'
    },
    userAgent: {
      metavar: '<USER-AGENT>',
      default: defaultConfig.userAgent,
      help: 'The full User Agent string, default is Chrome for MacOSX. [userAgent|ipad|iphone].'
    },
    viewPort: {
      metavar: '<WidthxHeight>',
      default: defaultConfig.viewPort,
      help: 'The view port, the page viewport size WidthxHeight like 400x300.'
    },
    yslow: {
      abbr: 'y',
      metavar: '<FILE>',
      default: defaultConfig.yslow,
      help: 'The compiled YSlow file. Use this if you have your own rules.',
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
      help: 'The path to the limit configuration file.'
    },
    basicAuth: {
      metavar: '<USERNAME:PASSWORD>',
      help: 'Basic auth user & password.'
    },
    browser: {
      abbr: 'b',
      metavar: '<BROWSER>',
      help: 'Choose which browser to use to collect timing data. Use multiple browsers in a comma separated list (firefox|chrome|phantomjs)',
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
    connection: {
      // TODO define a couple of different types
      default: 'native',
      help: 'Limit the speed by simulating connection types. Choose between ' + defaultConfig.connection
    },
    btConfig: {
      metavar: '<FILE>',
      help: 'Additional BrowserTime JSON configuration as a file',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          return 'Couldnt find the BrowserTime JSON file:' + fs.realpathSync(file);
        }
      }
    },
    profile: {
      metavar: '<desktop|mobile>',
      choices: ['desktop', 'mobile'],
      default: defaultConfig.profile,
      help: 'Choose between testing for desktop or mobile. Testing for desktop will use desktop rules & user agents and vice verca.'
    },
    no: {
      abbr: 'n',
      metavar: '<NUMBEROFTIMES>',
      default: defaultConfig.no,
      help: 'The number of times you should test each URL when fetching timing metrics. Default is ' + defaultConfig.no +
        ' times.',
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
      help: 'A comma separated list of rules to skip when generating JUnit/TAP output.'
    },
    testData: {
      default: defaultConfig.testData,
      help: 'Choose which data to send test when generating TAP/JUnit output. Default is all availible [rules,timings,wpt,gpsi]'
    },
    budget: {
      metavar: '<FILE>',
      help: 'A file containing the web perf budget rules. See http://www.sitespeed.io/documentation/#budget',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          return 'Couldnt find the budget JSON file:' + fs.realpathSync(file);
        }
      }
    },
    maxPagesToTest: {
      abbr: 'm',
      metavar: '<NUMBEROFPAGES>',
      help: 'The max number of pages to test. Default is no limit.'
    },
    storeJson: {
      flag: false,
      help: 'Store all collected data as JSON.'
    },
    proxy: {
      abbr: 'p',
      metavar: '<PROXY>',
      help: 'http://proxy.soulgalore.com:80'
    },
    cdns: {
      metavar: '<cdn1.com,cdn.cdn2.net>',
      list: true,
      help: 'A comma separated list of additional CDNs.'
    },
    postTasksDir: {
      metavar: '<dir>',
      help: 'The directory where you have your extra post tasks.',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          return 'Couldnt find the dir:' + fs.realpathSync(file);
        }
      }
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
    wptConfig: {
      metavar: '<FILE>',
      help: 'WebPageTest configuration, see https://github.com/marcelduran/webpagetest-api runTest method ',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          return 'Couldnt find the WPT JSON configuration file:' + fs.realpathSync(file);
        }
      }
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
      metavar: '<FILE>',
      help: 'Any request headers to use, a file with JSON form of {\"name\":\"value\",\"name2\":\"value\"}. Not supported for WPT & GPSI.',
      callback: function(file) {
        if (!fs.existsSync(file)) {
          return 'Couldnt find the request headers JSON file:' + fs.realpathSync(file);
        }
      }
    }
  }).parse();

if ((!cli.url) && (!cli.file) && (!cli.sites)) {
  console.log('You must specify either a URL to test or a file with URL:s');
  console.log(require('nomnom').getUsage());
  process.exit(1);
}

// read configuration files
if (cli.requestHeaders) {
  cli.requestHeaders = fileHelper.getFileAsJSON(cli.requestHeaders);
}

if (cli.wptConfig) {
  cli.wptConfig = fileHelper.getFileAsJSON(cli.wptConfig);
}

if (cli.budget) {
  cli.budget = fileHelper.getFileAsJSON(cli.budget);
}

if (cli.btConfig) {
  cli.btConfig = fileHelper.getFileAsJSON(cli.btConfig);
}

if (cli.file) {
  cli.urls = fileHelper.getFileAsArray(cli.file);
}

if (cli.sites) {
  cli.sites = fileHelper.getFileAsArray(cli.sites);
}

module.exports = cli;
