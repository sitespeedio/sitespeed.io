/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var render = require('./util/htmlRenderer'),
  columnsMetaData = require('../conf/columnsMetaData.json');

function SitesHTMLRenderer(config) {
  this.numberOfAnalyzedPages = 0;
  this.config = config;
  this.ruleDictionary = {};
}

SitesHTMLRenderer.prototype.renderSites = function(sitesAggregates, cb) {
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

module.exports = SitesHTMLRenderer;
