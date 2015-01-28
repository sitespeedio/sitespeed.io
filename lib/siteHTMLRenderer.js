/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var ySlowUtil = require('./util/yslowUtil'),
  util = require('./util/util'),
  render = require('./util/htmlRenderer');

function SiteHTMLRenderer(config) {
  this.numberOfAnalyzedPages = 0;
  this.config = config;
  this.ruleDictionary = {};
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

module.exports = SiteHTMLRenderer;
