/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var util = require('../util/util'),
  winston = require('winston'),
  net = require('net');

function GraphiteCollector(config) {
  this.config = config;
  this.namespace = this.config.graphiteNamespace;
  this.log = winston.loggers.get('sitespeed.io');
  this.timeStamp = ' ' + Math.round(new Date().getTime() / 1000) + '\n';
}

GraphiteCollector.prototype.collect = function(aggregates, pages, domains) {

  var config = this.config;
  var self = this;
  var statistics = '';
  pages.forEach(function(page) {
    statistics += self._getPageStats(page);
  });

  if (this.config.graphiteData.indexOf('summary') > -1 || this.config.graphiteData.indexOf(
      'all') > -1) {
    statistics += this._getSummaryStats(aggregates, config.urlObject.hostname);
  }

  statistics += self._getDomainStats(domains, config.urlObject.hostname);



  return statistics;

};

GraphiteCollector.prototype._getPageStats = function(page) {

  var statistics = '';

  var urlKey = util.getGraphiteURLKey(decodeURIComponent(page.url));

  // lets collect the specific data per
  statistics += this._getRuleStats(page, urlKey);
  statistics += this._getTimingStats(page, urlKey);
  statistics += this._getPageMetricsStats(page, urlKey);
  statistics += this._getGPSIStats(page, urlKey);
  statistics += this._getWPTStats(page, urlKey);
  statistics += this._getAssetsStats(page, urlKey);
  return statistics;

};

GraphiteCollector.prototype._getRuleStats = function(page, urlKey) {

  var statistics = '';
  var self = this;
  if (page.yslow && (this.config.graphiteData.indexOf('rules') > -1 || this.config.graphiteData.indexOf(
      'all') > -1)) {
    Object.keys(page.rules).forEach(function(rule) {
      statistics += self.namespace + '.' + urlKey + 'rules.' + rule + ' ' +
        page.rules[rule].v + self.timeStamp;
    });
  }

  return statistics;
};

GraphiteCollector.prototype._getTimingStats = function(page, urlKey) {

  var statistics = '';
  var timingsWeWillPush = ['min', 'median', 'p90', 'max'];
  var self = this;

  // the timings that are not browser specific
  if (this.config.graphiteData.indexOf('timings') > -1 || this.config.graphiteData.indexOf(
      'all') > -1) {
    // check that we actually collect browser data
    if (page.timings) {
      Object.keys(page.timings).forEach(function(timing) {
        timingsWeWillPush.forEach(function(val) {
          // is it a browser?
          if (self.config.supportedBrowsers.indexOf(timing) < 0) {
            statistics += self.namespace + '.' + urlKey + 'timings.' + timing +
              '.' + val + ' ' + page.timings[timing][val].v + self.timeStamp;
          }
        });
      });

      // and the browsers
      Object.keys(page.timings).forEach(function(browser) {
        if (self.config.supportedBrowsers.indexOf(browser) > -1) {
          Object.keys(page.timings[browser]).forEach(function(timing) {
            timingsWeWillPush.forEach(function(val) {
              statistics += self.namespace + '.' + urlKey + 'timings.' +
                browser + '.' + timing + '.' + val + ' ' + page.timings[
                  browser][timing][val].v + self.timeStamp;
            });
          });
        }
      });
    }
  }
  return statistics;
};

GraphiteCollector.prototype._getPageMetricsStats = function(page, urlKey) {

  var statistics = '';
  var self = this;

  if (this.config.graphiteData.indexOf('pagemetrics') > -1 || this.config.graphiteData.indexOf(
      'all') > -1) {
    // and all the assets
    if (page.yslow) {
      Object.keys(page.yslow.assets).forEach(function(asset) {
        statistics += self.namespace + '.' + urlKey + 'assets.' + asset +
          ' ' + page.yslow.assets[asset].v + self.timeStamp;
      });

      // and page specific
      statistics += self.namespace + '.' + urlKey + 'score' + ' ' + page.score +
        self.timeStamp;
      statistics += self.namespace + '.' + urlKey + 'requests' + ' ' + page.yslow
        .requests.v + self.timeStamp;
      statistics += self.namespace + '.' + urlKey + 'requestsMissingExpire' +
        ' ' + page.yslow.requestsMissingExpire.v + self.timeStamp;
      statistics += self.namespace + '.' + urlKey +
        'timeSinceLastModification' + ' ' + page.yslow.timeSinceLastModification
        .v + self.timeStamp;
      statistics += self.namespace + '.' + urlKey + 'cacheTime' + ' ' + page.yslow
        .cacheTime.v + self.timeStamp;
      statistics += self.namespace + '.' + urlKey + 'pageWeight' + ' ' + page.yslow
        .pageWeight.v + self.timeStamp;
    }
  }

  return statistics;
};

GraphiteCollector.prototype._getGPSIStats = function(page, urlKey) {
  // add gspi score
  if (page.gpsi) {
    return this.namespace + '.' + urlKey + 'gpsi' + ' ' + page.gpsi.gscore.v + this.timeStamp;
  } else {
    return '';
  }
};

GraphiteCollector.prototype._getWPTStats = function(page, urlKey) {

  var statistics = '';
  var self = this;
  // add wpt data
  if (page.wpt) {
    Object.keys(page.wpt).forEach(function(location) {
      Object.keys(page.wpt[location]).forEach(function(browser) {
        Object.keys(page.wpt[location][browser]).forEach(function(connectivity) {
          Object.keys(page.wpt[location][browser][connectivity]).forEach(function(view) {
            Object.keys(page.wpt[location][browser][connectivity][view]).forEach(function(metric) {
              statistics += self.namespace + '.' + urlKey + 'wpt.' + location + '.' +
                connectivity + '.' + browser + '.' + view + '.' + metric + '.median ' +
                page.wpt[location][browser][connectivity][view][metric].v +
                self.timeStamp;
            });
          });
        });
      });
    });
  }

  return statistics;
};


GraphiteCollector.prototype._getAssetsStats = function(page, urlKey) {

  var stats = '';
  if (this.config.graphiteData.indexOf('requesttimings') > -1 || this.config.graphiteData.indexOf(
      'all') > -1) {
    if (page.har) {
      var self = this;
      var timings = ['blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive'];
      page.har.forEach(function(har) {

        har.log.entries.forEach(function(entry) {
          var assetURL = util.getGraphiteURLKey(decodeURIComponent(entry.request.url), '_');

          // get the timestamp from the HAR when the action happend
          var timeStamp = ' ' + Math.round(new Date(entry.startedDateTime).getTime() / 1000) + '\n';
          var total = 0;
          if (entry.timings) {
            timings.forEach(function(timing) {
              total += entry.timings[timing];
              stats += self.namespace + '.' + urlKey + 'timings.requests.' + assetURL + '.' + timing +
                ' ' + entry.timings[timing] + timeStamp;
            });
            stats += self.namespace + '.' + urlKey + 'timings.requests.' + assetURL + '.total ' + total + ' ' +
              timeStamp;

          }
        });

      });
    }
  }
  return stats;
};

GraphiteCollector.prototype._getDomainStats = function(domains, hostname) {

  var stats = '';
  if (domains) {

    var self = this;
    var timings = ['blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive', 'total'];
    var values = ['min', 'median', 'max'];

    domains.forEach(function(domain) {
      timings.forEach(function(timing) {
        values.forEach(function(value) {
          stats += self.namespace + '.summary.' + hostname + '.domains.timings.' + domain.domain.split('.').join('_') + '.' +
            timing + '.' +
            value + ' ' + util.getStatisticsObject(domain[timing].stats, 0)[value] + self.timeStamp;
        });
      });
      stats += self.namespace + '.summary.' + hostname + '.domains.' + domain.domain.split('.').join('_') + '.requests' + ' ' + domain
        .count +
        self.timeStamp;
    });
  }

  return stats;
};


GraphiteCollector.prototype._getSummaryStats = function(aggregates, hostname) {
  var statistics = '';
  var self = this;
  var values = ['min', 'p10', 'median', 'mean', 'p90', 'p99', 'max'];

  aggregates.forEach(function(aggregate) {
    values.forEach(function(value) {
      // special handling for WPT values for now
      if (aggregate.id.indexOf('WPT') > -1) {
        statistics += self.namespace + '.summary.' + hostname + '.' + aggregate.type + '.wpt.' +
          aggregate.key + '.' + value + ' ' + aggregate.stats[value] + self.timeStamp;

      } else {
        statistics += self.namespace + '.summary.' + hostname + '.' + aggregate.type + '.' + aggregate.id +
          '.' + value + ' ' + aggregate.stats[value] + self.timeStamp;
      }
    });
  });
  return statistics;
};

module.exports = GraphiteCollector;
