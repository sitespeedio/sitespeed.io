/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
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
  var fastestSiteFirst = [];
  var highestScoreFirst = [];

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

    sitesAggregates[site].forEach(function(metric) {
      if (metric.id === 'ruleScore') {
        highestScoreFirst.push({
          'site': site,
          'stats': metric.stats.median
        });
      } else if (metric.id === 'speedIndex') {
        fastestSiteFirst.push({
          'site': site,
          'stats': metric.stats.median
        });
      }
    });
  });

  fastestSiteFirst.sort(function(site, thatSite) {
    return site.stats - thatSite.stats;
  });

  highestScoreFirst.sort(function(site, thatSite) {
    return thatSite.stats - site.stats;
  });

  // add difference
  var i = 0;
  var fastest;
  fastestSiteFirst.forEach(function(site) {
    if (i === 0) {
      fastest = site.stats;
    } else {
      site.diff = ((site.stats - fastest) / fastest) * 100;
      site.diff = 0;
    }
    i++;
  });

  i = 0;
  highestScoreFirst.forEach(function(site) {
    if (i === 0) {
      fastest = site.stats;
      site.diff = 0;
    } else {
      site.diff = ((fastest - site.stats) / fastest) * 100;
    }
    i++;
  });

  var renderData = {
    'sitesAndAggregates': sitesAndAggregates,
    'sitesAggregates': sitesAggregates,
    'columns': this.config.sitesColumns,
    'config': this.config,
    'columnsMeta': columnsMetaData,
    'ruleDictionary': this.ruleDictionary,
    'highestScore': highestScoreFirst,
    'fastestSites': fastestSiteFirst,
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
