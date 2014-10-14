/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var columnsMetaData = require('../conf/columnsMetaData.json'),
  ySlowUtil = require('./util/yslowUtil'),
  util = require('./util/util'),
  render = require('./util/htmlRenderer');

function HTMLRenderer(config) {
  this.numberOfAnalyzedPages = 0;
  this.config = config;
  this.ruleDictionary = {};
}

HTMLRenderer.prototype.renderPage = function(url, pageData, cb) {
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
  } else {
    renderData.url = util.getURLFromPageData(pageData);
  }

  this.ruleDictionary = pageData.yslow.dictionary.rules;

  renderData.gpsiData = pageData.gpsi;
  renderData.browsertimeData = pageData.browsertime;
  renderData.wptData = pageData.webpagetest;
  if (pageData.phantomjs) {
    renderData.phantomjsData = pageData.phantomjs.getStats();
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

HTMLRenderer.prototype.renderSites = function(sitesAggregates, cb) {

  var sitesAndAggregates = [];
  var self = this;

  // Add all sites data sorted
  Object.keys(sitesAggregates).forEach(function(site) {
    sitesAndAggregates.push({
      'site': site,
      'aggregates': sitesAggregates[site].filter(function(box) {
        return (self.config.sitesColumns.indexOf(box.id) > -1);
      }).sort(function(box, box2) {
        return self.config.sitesColumns.indexOf(box.id) - self.config.sitesColumns.indexOf(box2.id);
      })
    });
  });
  var renderData = {
    'sitesAndAggregates': sitesAndAggregates,
    'columns': this.config.sitesColumns,
    'config': this.config,
    'columnsMeta': columnsMetaData,
    'ruleDictionary': this.ruleDictionary,
    'pageMeta': {
      'title': '',
      'description': '',
      'hideMenu': true,
      'isSites': true
    }
  };
  render('sites', renderData, this.config.run.absResultDir, cb, 'sites.html', '..');
};

module.exports = HTMLRenderer;