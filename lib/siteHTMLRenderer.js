/**
 * Sitespeed.io - How speedy is your site? (https://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var ySlowUtil = require('./util/yslowUtil'),
  util = require('./util/util'),
  simplehar = require('simplehar.sitespeed.io'),
  path = require('path'),
  fs = require('fs-extra'),
  winston = require('winston'),
  inspect = require('util').inspect,
  render = require('./util/htmlRenderer');

function SiteHTMLRenderer(config) {
  this.numberOfAnalyzedPages = 0;
  this.config = config;
  this.ruleDictionary = {};
  this.log = winston.loggers.get('sitespeed.io');
}

SiteHTMLRenderer.prototype.renderPage = function(url, pageData, cb) {
  this.numberOfAnalyzedPages++;

  var renderData = {};
  if (pageData.yslow) {
    renderData = {
      'url': pageData.yslow.originalUrl,
      'score': pageData.yslow.o,
      'size': ySlowUtil.getSize(pageData.yslow.comps),
      'rules': pageData.yslow.g,
      'assets': pageData.yslow.comps,
      'noOfDomains': ySlowUtil.getNumberOfDomains(pageData.yslow.comps),
      'timeSinceLastModificationStats': ySlowUtil.getLastModStats(pageData.yslow.comps),
      'cacheTimeStats': ySlowUtil.getCacheTimeStats(pageData.yslow.comps),
      'noOfAssetsThatIsCached': (pageData.yslow.comps.length - pageData.yslow.g.expiresmod.components.length),
      'assetsPerDomain': ySlowUtil.getAssetsPerDomain(pageData.yslow.comps),
      'assetsPerContentType': ySlowUtil.getAssetsPerContentType(pageData.yslow.comps),
      'sizePerContentType': ySlowUtil.getAssetsSizePerContentType(pageData.yslow.comps),
      'ruleDictionary': pageData.yslow.dictionary.rules
    };

    this.ruleDictionary = pageData.yslow.dictionary.rules;
  } else {
    renderData.url = util.getURLFromPageData(pageData);
  }

  renderData.gpsiData = pageData.gpsi;
  if (pageData.browsertime) {
    renderData.browsertimeData = pageData.browsertime.browsertime;
  }
  if (pageData.webpagetest) {
    renderData.wptData = pageData.webpagetest.wpt;
  }
  if (pageData.headless) {
    renderData.headlessData = pageData.headless.getStats();
  }

  renderData.config = this.config;
  renderData.pageMeta = {
    'path': '../',
    'title': 'Page data, collected by sitespeed.io for page ' + url,
    'description': 'All data collected for this individual page.'
  };
  var hash = util.getFileName(url);
  render('page', renderData, this.config.run.absResultDir, cb, hash + '.html', 'pages');
};

SiteHTMLRenderer.prototype.renderHAR = function(url, pageData, cb) {
  var config = this.config;
  var log = this.log;

  if (config.btConfig && config.btConfig.noProxy) {
    return cb();
  }

  var browserRun = 0;
  config.browsertime.forEach(function(browser) {
    var hash = util.getFileName(url);

    try {
      var result = simplehar({
        har: path.join(config.run.absResultDir, 'data', 'har', browser, hash + '.har'),
        lng: false,
        frame: true,
        return: true,
        frameContent: {
          css: false,
          js: false
        }
      });

      var run = 0;

      result.html = Array.isArray(result.html) ? result.html : [result.html];
      result.html.forEach(function(har) {

        var renderData = {
          'har': har,
          'run': run,
          'browser': browser,
          'url': util.getURLFromPageData(pageData),
          'timings': pageData.browsertime.browsertime[browserRun].default.data[run].timings,
          'speedIndex': pageData.browsertime.browsertime[browserRun].default.data[run].speedIndex,
          'firstPaint': pageData.browsertime.browsertime[browserRun].default.data[run].firstPaint,
          'navigationTiming': pageData.browsertime.browsertime[browserRun].default.data[run].navigationTiming,
          'userTimings': pageData.browsertime.browsertime[browserRun].default.data[run].userTimings.marks,
          'config': config
        };
        renderData.pageMeta = {
          'path': '../../',
          'title': 'HAR waterfall using ' + browser + ' run ' + (run + 1) + ' for ' + url,
          'description': 'HAR waterfall using ' + browser + ' run ' + (run + 1) + ' for ' + url
        };
        render('har', renderData, config.run.absResultDir, cb, hash + '-' + run + '.html', path.join('har',
          browser));
        run++;
      });
    } catch (err) {
      log.error('Could not generate HAR for ' + url + ' ' + inspect(err));
    }
    browserRun++;
  });
};

module.exports = SiteHTMLRenderer;
