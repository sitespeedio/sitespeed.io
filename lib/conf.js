/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var dateFormat = require('dateformat'),
urlParser = require('url'),
fs = require('fs-extra'),
path = require('path'),
supportedBrowsers = ['chrome','ie','firefox','phantomjs'],
config = require('nomnom').options({
  url: {
    abbr: 'u',
    metavar: '<URL>',
    help: 'The start url'
  },
  file: {
    abbr: 'f',
    metavar: '<FILE>',
    help: 'The path to a plain text file with one URL on each row. Each line must end with a new line in the file.',
    callback: function(file) {
      if (!fs.existsSync(file)) {
        return 'Could not find the file:' + file;
      }
    }
  },
  sites: {
    metavar: '<FILE>',
    help: 'The path to a plain text file with one URL on each row. Each line must end with a new line in the file.',
    callback: function(file) {
      if (!fs.existsSync(file)) {
        return 'Couldnt find the file:' + file;
      }
    }
  },
  version: {
    flag: true,
    abbr: 'v',
    help: 'Display the sitespeed.io version',
    callback: function() {
      return require('../package.json').version;
    }
  },
  deep: {
    abbr: 'd',
    metavar: '<INTEGER>',
    default: 1,
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
    help: 'Only crawl URLs that contains this in the path'
  },
  skip: {
    abbr: 's',
    metavar: '<KEYWORD>',
    help: 'Do not crawl pages that contains this in the path'
  },
  threads: {
    abbr: 't',
    metavar: '<NOOFTHREADS>',
    default: 5,
    help: 'The number of threads/processes that will analyze pages.',
    callback: function(threads) {
      if (threads != parseInt(threads)) { // jshint ignore:line
        return 'You must specify an integer of how many processes/threads that will analyze your page';
      }
      else if (parseInt(threads) <= 0) {
        return 'You must specify a positive integer';
      }
    }
  },
  name: {
    metavar: '<NAME>',
    help: 'Give your test a name, it will be added to all HTML pages'
  },
  memory: {
    metavar: '<INTEGER>',
    default: 1024,
    help: 'We still use Java for a couple of things and you can configure how much memory that the process will have (in mb).'
  },
  resultBaseDir: {
    abbr: 'r',
    metavar: '<DIR>',
    default: 'sitespeed-result',
    help: 'The result base directory',
    callback: function(file) {
      if (!fs.existsSync(file)) {
        fs.mkdirs(file, function(err){
          if (err) {
            return 'Couldnt create the result base dir:' + err;
          }
          });
      }
    }
  },
  userAgent: {
    metavar: '<USER-AGENT>',
    default: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36',
    help: 'The full User Agent string, default is Chrome for MacOSX. You can also set the value as iphone or ipad (will automagically change the viewport)'
  },
  viewPort: {
    metavar: '<WidthxHeight>',
    default: '1280x800',
    help: 'The view port, the page viewport size WidthxHeight, like 400x300.'
  },
  yslow: {
    abbr: 'y',
    metavar: '<FILE>',
    default: 'phantomjs/yslow-3.1.8-sitespeed.js',
    help: 'The compiled YSlow file.',
    callback: function(file) {
      if (!fs.existsSync(file)) {
        return 'Couldnt find the file:' + fs.realpathSync(file);
      }
    }
  },
  ruleSet: {
    metavar: '<RULE-SET>',
    default: 'sitespeed.io-desktop',
    help: 'Which ruleset to use.'
  },
  limitFile: {
    metavar: '<PATH>',
    default: '../conf/desktop-rules.json',
    help: 'The path to the limit configuration file'
  },
  basicAuth: {
    metavar: '<USERNAME:PASSWORD>',
    help: 'Basic auth user & password'
  },
  browser: {
    abbr: 'b',
    metavar: '<BROWSER>',
    help: 'Choose which browser to use to collect timing data. You can set multiple browsers in a comma separated list (firefox|chrome|ie|phantomjs)',
    callback: function(browsers) {
      var b = browsers.split(','),
      invalidBrowsers = b.filter(function(browser) {
        return supportedBrowsers.indexOf(browser) < 0;
      });

      if (invalidBrowsers.length > 0) {
        return 'You specified a browser that is not supported:' + invalidBrowsers;
      }
    }
  },
  profile: {
    metavar: '<desktop|mobile>',
    choices: ['desktop', 'mobile'],
    default: 'desktop',
    help: 'Choose between testing for desktop or mobile. Testing for desktop will use desktop rules & user agents, and vice verca'
  },
  no: {
    abbr: 'n',
    metavar: '<NUMBEROFTIMES>',
    default: 3,
    help: 'The number of times you should test each URL when fetching timing metrics. Default is three times',
    callback: function(n) {
      if (n != parseInt(n)) { // jshint ignore:line
        return 'You must specify an integer of how many times you want to test one URL';
      }
      else if (parseInt(n) <= 0) {
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
    help: 'Create JUnit output'
  },
  skipTest: {
    metavar: '<ruleid1,ruleid2,...>',
    help: 'A comma separeted list of rules to skip when generating JUnit'
  },
  threshold: {
    default: 90,
    metavar: '[0-100]',
    help: 'Threshold score for tests, will be used of no mathing thresholdFile with values match. Use : --threshold 95'
  },
  thresholdFile: {
    metavar: '<FILE>',
    help: 'A file containing JSON like  {\'overall\': 90, \'thirdpartyversions\': 85}'
  },
  timingsThresholdFile: {
    metavar: '<FILE>',
    help: 'A file containing JSON like ...'
  },
  csv: {
    flag: true,
    help: 'Also output CSV where applicable'
  },
  maxPagesToTest: {
    abbr: 'm',
    metavar: '<NUMBEROFPAGES>',
    help: 'The max number of pages to test. Default is no limit'
  },
  proxy: {
    abbr: 'p',
    metavar: '<PROXY>',
    help: 'http://proxy.soulgalore.com:80'
  },
  cdns: {
    metavar: '<cdn1,cdn2>',
    list: true,
    help: 'A comma separated list of additional CDNs'
  },
  boxes: {
    metavar: '<box1,box2>',
    list: true,
    help: 'The boxes showed on site summary page, see http://www.sitespeed.io/documentation/#config-boxes for more info'
  },
  columns: {
    abbr: 'c',
    metavar: '<column1,column2>',
    list: true,
    help: 'The columns showed on detailed page summary table, see http://www.sitespeed.io/documentation/#config-columns for more info'
  },
  configFile: {
    metavar: '<PATH>',
    help: 'The path to a sitespeed.io config.json file, if it exists all other input parameters will be overidden'
  },
  // TODO How to override existing
  aggregators: {
    metavar: '<PATH>',
    help: 'The path to a directory with extra aggregators, see YYY'
  },
  // TODO maybe collectors are overkill
  collectors: {
    metavar: '<PATH>',
    help: 'The path to a directory with extra collectors, see YYY'
  },
  graphiteHost: {
    metavar: '<HOST>',
    help: 'The Graphite host'
  },
  graphitePort: {
    metavar: '<INTEGER>',
    default: 2003,
    help: 'Graphite port'
  },
  graphiteNamespace: {
    metavar: '<NAMESPACE>',
    default: 'sitespeed.io',
    help: 'The namespace of the data sent to Graphite'
  },
  graphiteData: {
    default: 'all',
    help: 'Choose which data to send to Graphite by a comma separated list. Default all data is sent. [summary,rules,pagemetrics,timings]'
  },
  gpsiKey: {
    help: 'Your Google API Key, configure it to also fetch data from Google Page Speed Insights'
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
    help: 'The URL to your private webpagetest instance'
  },
  wptKey: {
    metavar: '<KEY>',
    help: 'The API key if running on webpagetest on the public instances'
  },
  requestHeaders: {
    metavar: '<JSON>',
    help: 'Any request headers to use, in the JSON form of {\"name\":\"value\",\"name\":\"value\"}. Not supported for WPT & GPSI'
  }
}).parse();

if (config.browser) {
  var b = config.browser.split(','),
  configuredBrowsers = b.filter(function(browser) {
    return supportedBrowsers.indexOf(browser) > -1;
  });

  if (configuredBrowsers.indexOf('phantomjs')>-1) {
    config.phantomjs = true;
    if (configuredBrowsers.length>1) {
      var i = configuredBrowsers.indexOf('phantomjs');
      configuredBrowsers.splice(i,1);
      config.browsertime = configuredBrowsers;
    }
  }
  else {
    config.browsertime = configuredBrowsers;
  }
}

if ((!config.url) && (!config.file) && (!config.sites)) {
  console.log('You must specify either a URL to test or a file with URL:s');
  process.exit(1);
}

// If we supply a configuration file, then it will ovveride all current conf, meaning
// we can easily use the same conf over and over again
if (config.configFile) {
  config = JSON.parse(fs.readFileSync(config.configFile));
}

config.runYslow = config.noYslow?false:true;

// The run always has a fresh date
config.run = {};
config.run.date = new Date();

// Setup the absolute result dir

var startPath = (config.resultBaseDir.charAt(0) === path.sep) ? config.resultBaseDir : path.join(__dirname, '../',
  config.resultBaseDir);

if (config.url) {
  config.urlObject = urlParser.parse(config.url);
    config.run.absResultDir = path.join(startPath, config.urlObject.hostname, dateFormat(config.run.date, 'yyyy-mm-dd-HH-MM-ss') );
} else if (config.file) {
  // TODO handle the file name in a good way if it contains chars that will not fit in a dir
  config.run.absResultDir = path.join(startPath, config.file, dateFormat(config.run.date, 'yyyy-mm-dd-HH-MM-ss') );
} else if (config.sites) {
  // The log file will end up here
  config.run.absResultDir = path.join(startPath, 'sites', dateFormat(config.run.date, 'yyyy-mm-dd-HH-MM-ss'));
}

// Parse the proxy info as a real URL
if (config.proxy) {
  config.urlProxyObject = urlParser.parse(config.proxy);
}

if (config.thresholdFile) {
  config.thresholds = require(config.thresholdFile);
}

if (config.timingsThresholdFile) {
  config.timingThresholds = require(config.timingsThresholdFile);
}
else {
  config.timingThresholds = require('../conf/junit-timings.json');
}
// decide which rules to use ...
if (config.profile === 'mobile') {
  config.rules= require('../conf/mobile-rules.json');
  config.ruleSet = 'sitespeed.io-mobile';
  config.userAgent = 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25';
  config.viewPort = '320x444';
}
else {
  config.rules= require(config.limitFile);
  // The rest use the default/configured one, will that work? :)
}

config.summaryBoxes = ['ruleScore'];

config.sitesColumns = ['requests','criticalPathScore','pageWeight','cacheTime','ruleScore'];

if (config.runYslow) {
    config.pageColumns = ['yslow.assets.js','yslow.assets.css','yslow.assets.img','yslow.requests','rules.expiresmod.items','yslow.pageWeight', 'rules.avoidscalingimages.items','rules.criticalpath'];
  }
if (config.columns) {
  config.pageColumns = config.columns[0].split(',');
}


if (config.gpsiKey) {
  config.summaryBoxes.push('gpsi.gscore');
  config.sitesColumns.push('gpsi.gscore');
  config.pageColumns.push('gpsi.gscore');
}
config.summaryBoxes.push('criticalPathScore', 'jsSyncInHead',
  'jsPerPage', 'cssPerPage', 'cssImagesPerPage', 'fontsPerPage',
  'imagesPerPage', 'requests', 'requestsWithoutExpires', 'requestsWithoutGzip',
  'docWeight', 'jsWeightPerPage', 'cssWeightPerPage', 'imageWeightPerPage',
  'pageWeight', 'browserScaledImages', 'spofPerPage', 'numberOfDomains',
  'singleDomainRequests', 'redirectsPerPage', 'cacheTime', 'timeSinceLastMod');

if (config.wptUrl) {
  config.summaryBoxes.push('wpt.imageSavings','wpt.speedIndex','wpt.visualComplete');
  config.sitesColumns.push('wpt.speedIndex');
  config.pageColumns.push('wpt.speedIndex');
}

if (config.browser) {
  config.summaryBoxes.push('serverResponseTime','backEndTime','frontEndTime','domContentLoadedTime','pageLoadTime','firstPaintTime');
  config.sitesColumns.push('serverResponseTime','domContentLoadedTime');
  config.pageColumns.push('timings.serverResponseTime.median','timings.domContentLoadedTime.median');
}

if (config.boxes) {
  if (config.boxes[0].indexOf('+')===0) {
      config.boxes[0].split(',').forEach(function (box) {
      if (box.indexOf('+')===0) {
        config.summaryBoxes.push(box.substring(1));
      }
      else {
        config.summaryBoxes.push(box);
      }
      });
  }
  else {
    config.summaryBoxes = config.boxes[0].split(',');
  }
}

config.dataDir = 'data';

config.supportedBrowsers = supportedBrowsers;

module.exports = config;
