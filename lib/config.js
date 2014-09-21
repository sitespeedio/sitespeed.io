var supportedBrowsers = ['chrome', 'ie', 'firefox', 'phantomjs'],
  urlParser = require('url'),
  dateFormat = require('dateformat'),
  path = require('path');

exports.setupConfiguration = function(config) {
  // TODO set default values and incorpoate in conf.js


  // to be able to run sitespeed.io you need to specify a file, a URL or a file
  if ((!config.url) && (!config.file) && (!config.sites)) {
    console.log('You must specify either a URL to test or a file with URL:s');
    process.exit(1);
  }

  // to make it easy later on, we add:
  // config.browertime = the browser(s) that will be run in browsertime (not phantomjs)
  // config.phantomjs - boolean to run phantomjs for timings or not
  if (config.browser) {
    var b = config.browser.split(','),
      configuredBrowsers = b.filter(function(browser) {
        return supportedBrowsers.indexOf(browser.toLowerCase()) > -1;
      });

    if (configuredBrowsers.indexOf('phantomjs') > -1) {
      config.phantomjs = true;
      if (configuredBrowsers.length > 1) {
        var i = configuredBrowsers.indexOf('phantomjs');
        configuredBrowsers.splice(i, 1);
        config.browsertime = configuredBrowsers;
      }
    } else {
      config.browsertime = configuredBrowsers;
    }
  }


  // If we supply a configuration file, then it will ovveride all current conf, meaning
  // we can easily use the same conf over and over again
  if (config.configFile) {
    config = JSON.parse(fs.readFileSync(config.configFile));
  }

  // should we test YSlow rules, default is true
  config.runYslow = config.noYslow ? false : true;

  // The run always has a fresh date
  config.run = {};
  config.run.date = new Date();

  // Setup the absolute result dir
  var startPath = (config.resultBaseDir.charAt(0) === path.sep) ? config.resultBaseDir : path.join(__dirname, '../',
    config.resultBaseDir);

  if (config.url) {
    config.urlObject = urlParser.parse(config.url);
    config.run.absResultDir = path.join(startPath, config.urlObject.hostname, dateFormat(config.run.date,
      'yyyy-mm-dd-HH-MM-ss'));
  } else if (config.file) {
    // TODO handle the file name in a good way if it contains chars that will not fit in a dir
    config.run.absResultDir = path.join(startPath, config.file, dateFormat(config.run.date, 'yyyy-mm-dd-HH-MM-ss'));
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

  // decide which rules to use ...
  if (config.profile === 'mobile') {
    config.rules = require('../conf/mobileRules.json');
    config.ruleSet = 'sitespeed.io-mobile';
    config.userAgent =
      'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25';
    config.viewPort = '320x444';
  } else {
    if (config.limitFile) {
      config.rules = require(config.limitFile);
    } else {
      config.rules = require('../conf/desktopRules.json');
    }
    // The rest use the default/configured one, will that work? :)
  }

  config.summaryBoxes = ['ruleScore'];

  config.sitesColumns = ['requests', 'criticalPathScore', 'pageWeight', 'cacheTime', 'ruleScore'];

  if (config.runYslow) {
    config.pageColumns = ['yslow.assets.js', 'yslow.assets.css', 'yslow.assets.img', 'yslow.requests',
      'rules.expiresmod.items', 'yslow.pageWeight', 'rules.avoidscalingimages.items', 'rules.criticalpath'
    ];
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
    config.summaryBoxes.push('wpt.firstViewTTFB', 'wpt.firstViewSpeedIndex',
      'wpt.repeatViewSpeedIndex',
      'wpt.firstViewVisualComplete', 'wpt.repeatViewVisualComplete');
    config.sitesColumns.push('wpt.firstViewSpeedIndex', 'wpt.repeatViewSpeedIndex');
    config.pageColumns.push('wpt.firstViewSpeedIndex');
  }

  if (config.browsertime)  {
    config.summaryBoxes.push('serverResponseTime', 'backEndTime', 'frontEndTime', 'domContentLoadedTime',
      'pageLoadTime', 'firstPaintTime');
    config.sitesColumns.push('serverResponseTime', 'domContentLoadedTime');
    config.pageColumns.push('timings.serverResponseTime.median', 'timings.domContentLoadedTime.median');
  } // only show real browsers data if we configured both of them
  else if (config.phantomjs) {
    config.summaryBoxes.push('domContentLoadedTimePhantomJS', 'pageLoadTimePhantomJS');
    config.sitesColumns.push('domContentLoadedTimePhantomJS');
    config.pageColumns.push('phantomjs.domContentLoadedTime.median');
  }

  if (config.boxes) {
    if (config.boxes[0].indexOf('+') === 0) {
      config.boxes[0].split(',').forEach(function(box) {
        if (box.indexOf('+') === 0) {
          config.summaryBoxes.push(box.substring(1));
        } else {
          config.summaryBoxes.push(box);
        }
      });
    } else {
      config.summaryBoxes = config.boxes[0].split(',');
    }
  }

  config.dataDir = 'data';

  config.supportedBrowsers = supportedBrowsers;

  return config;
};