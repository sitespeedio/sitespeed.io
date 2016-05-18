/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */


/*
 *  Sample queries: 
 *      SELECT sum(value) FROM assets_size GROUP by asset_url 
        SELECT sum(value) FROM assets_size 
        SHOW TAG VALUES FROM assets_size WITH KEY = asset_url
        SHOW TAG VALUES FROM assets_size WITH KEY = asset_url WHERE asset_url =~ /static/
        SELECT sum(value) FROM assets_size WHERE asset_url !~ /static2/
        SELECT * FROM browser_timestats where metric = 'domComplete'  and subtype= 'median'
        select sum(value) from assets_timing GROUP BY asset_url ; 
        select asset_url,value from assets_size WHERE value > 100000; 
        select asset_url,value from assets_size WHERE value > 100000 and asset_url =~ /static2/
        SELECT sum(value)  FROM summary_domains_size WHERE domain =~ /static2/ GROUP BY domain  
        select metric,value from summary_nagivationtiming where metric='domainLookupEnd' OR metric='domComplete'

        https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming/domComplete
 */

'use strict';
var util = require('../util/util'),
  winston = require('winston'); 

var navigationTimingNames = ['navigationStart',
  'unloadEventStart',
  'unloadEventEnd',
  'redirectStart',
  'redirectEnd',
  'fetchStart',
  'domainLookupStart',
  'domainLookupEnd',
  'connectStart',
  'connectEnd',
  'secureConnectionStart',
  'requestStart',
  'responseStart',
  'responseEnd',
  'domLoading',
  'domInteractive',
  'domContentLoadedEventStart',
  'domContentLoadedEventEnd',
  'domComplete',
  'loadEventStart',
  'loadEventEnd'
];

function InfluxdbCollector(config) {
  this.config = config;
  this.namespace = this.config.influxdbNamespace;
  this.log = winston.loggers.get('sitespeed.io');
  this.timeStamp = ' ' + Math.round(new Date().getTime() / 1000) + '\n';
}

InfluxdbCollector.prototype.collect = function(aggregates, pages, domains) {

  var config = this.config;
  var self = this;
  var statistics = '';
  pages.forEach(function(page) {
    statistics += self._getPageStats(page);
  });

  if (this.config.graphiteData.indexOf('summary') > -1 || this.config.graphiteData.indexOf(
      'all') > -1) {
    statistics += this._getSummaryStats(aggregates, config.urlObject.hostname, pages.length);
  }

  statistics += self._getDomainStats(domains, config.urlObject.hostname);

	statistics += self._getMeta(pages);

  return statistics;

};

InfluxdbCollector.prototype._getMeta = function(pages) {
  var meta = '';
  var self = this;
  var sitespeedVersion = require('../../package.json').version;

  sitespeedVersion = sitespeedVersion.replace(/\./, '#').replace(/\./g, '').replace(/#/, '.');

  meta += 'meta_sitespeed_version value=' + sitespeedVersion + self.timeStamp;

  // a hack to get browser versions
  if (pages[0].har) {
    pages[0].har.forEach(function(har) {
      var version = har.log.browser.version;
      version = version.replace(/\./, '#').replace(/\./g, '').replace(/#/, '.');
      meta += 'meta_' + har.log.browser.name.toLowerCase() + '_version,namespace=' + self.namespace + ' value=' + version + self.timeStamp;
    });
  }

  return meta;
};

InfluxdbCollector.prototype._getPageStats = function(page) {

  var statistics = '';

  var urlKey = util.getGraphiteURLKey(decodeURIComponent(page.url));

  // lets collect the specific data per
  statistics += this._getRuleStats(page, urlKey);
  statistics += this._getBrowserTimeStats(page, urlKey);
  statistics += this._getPageMetricsStats(page, urlKey);
  statistics += this._getGPSIStats(page, urlKey);
  statistics += this._getWPTStats(page, urlKey);
  statistics += this._getAssetsStats(page, urlKey);

  return statistics;

};

InfluxdbCollector.prototype._getRuleStats = function(page, urlKey) {

  var statistics = '';
  var self = this;
  if (page.yslow && (this.config.graphiteData.indexOf('rules') > -1 || this.config.graphiteData.indexOf(
      'all') > -1)) {
    Object.keys(page.rules).forEach(function(rule) {
      statistics += rule + ',type=rule,namespace=' + self.namespace + ',url=' + urlKey  + ' value=' 
      + page.rules[rule].v + self.timeStamp;  

    });
    // FIXME : trim self.timeStamp and add + ' ' + 
  }

  return statistics;
};

InfluxdbCollector.prototype._getBrowserTimeStats = function(page, urlKey) {

  var statistics = '';
  var statsWeWillPush = ['min', 'median', 'p90', 'max'];
  var self = this;

  // the timings that are not browser specific
  if (this.config.graphiteData.indexOf('timings') > -1 || this.config.graphiteData.indexOf(
      'all') > -1) {

    // the types we have in our page object
    var types = ['timings', 'navigationtiming', 'custom', 'extras'];

    types.forEach(function(type) {

      // check that we actually collect browser data
      if (page[type]) {
        Object.keys(page[type]).forEach(function(timing) {
          statsWeWillPush.forEach(function(val) {
            // is it a browser?
            if (self.config.supportedBrowsers.indexOf(timing) < 0) {
              statistics += 'browser_timestats,namespace=' + self.namespace + ',url=' + urlKey + ',type=' + type + ',metric=' + timing +
                ',subtype=' + val + ' value=' + page[type][timing][val].v + self.timeStamp;
            }
          });
        });

        // and the browsers
        Object.keys(page[type]).forEach(function(browser) {
          if (self.config.supportedBrowsers.indexOf(browser) > -1) {
            Object.keys(page[type][browser]).forEach(function(timing) {
              statsWeWillPush.forEach(function(val) {
                statistics += 'browser_timestats,namespace=' + self.namespace + ',url=' + urlKey + ',type=' + type + ',browser=' +
                  browser + ',metric=' + timing + ',subtype=' + val +  ' value=' + page[type][browser][timing][val].v + self.timeStamp;
              });
            });
          }
        });
      }
    });
  }


  return statistics;
};

InfluxdbCollector.prototype._getPageMetricsStats = function(page, urlKey) {

  var statistics = '';
  var self = this;

  if (this.config.graphiteData.indexOf('pagemetrics') > -1 || this.config.graphiteData.indexOf(
      'all') > -1) {
    // and all the assets
    if (page.yslow) {
      Object.keys(page.yslow.assets).forEach(function(asset) {
        statistics += asset + ',type=asset,namespace=' + self.namespace + ',url=' + urlKey + ' value=' 
        + page.yslow.assets[asset].v + self.timeStamp;
      });

      // and page specific
      statistics += 'page_score,namespace='+self.namespace + ',url=' + urlKey + ' value=' + page.score +
        self.timeStamp;
      statistics += 'page_yslow_noRequest,namespace=' +self.namespace + ',url=' + urlKey + ' value=' + page.yslow
        .requests.v + self.timeStamp;
      statistics += 'page_yslow_requestsMissingExpire,namespace='+self.namespace + ',url=' + urlKey + ' value=' + page.yslow.requestsMissingExpire.v + self.timeStamp;
      statistics += 'page_yslow_timeSinceLastModification,namespace=' + self.namespace + ',url=' + urlKey + ' value=' + page.yslow.timeSinceLastModification
        .v + self.timeStamp;
      statistics += 'page_yslow_cacheTime,namespace=' +self.namespace + ',url=' + urlKey + ' value=' + page.yslow.cacheTime.v + self.timeStamp;
      statistics += 'page_yslow_pageWeight,namespace=' +self.namespace + ',url=' + urlKey + ' value=' + page.yslow.pageWeight.v + self.timeStamp;
    }
  }

  return statistics;
};

InfluxdbCollector.prototype._getGPSIStats = function(page, urlKey) {
  // add gspi score
  if (page.gpsi) {
    return this.namespace + '_' + urlKey + '_gpsi' + ' value=' + page.gpsi.gscore.v + this.timeStamp;
  } else {
    return '';
  }
};

InfluxdbCollector.prototype._getWPTStats = function(page, urlKey) {

  var statistics = '';
  var self = this;
  // add wpt data
  if (page.wpt) {
    Object.keys(page.wpt).forEach(function(location) {
      Object.keys(page.wpt[location]).forEach(function(browser) {
        Object.keys(page.wpt[location][browser]).forEach(function(connectivity) {
          Object.keys(page.wpt[location][browser][connectivity]).forEach(function(view) {
            Object.keys(page.wpt[location][browser][connectivity][view]).forEach(function(metric) {
              // we can have custom metrics that are not numbers
              // so lets skip them
              if (!isNaN(page.wpt[location][browser][connectivity][view][metric].v)) {
                statistics += self.namespace + '_' + urlKey + '_wpt_' + location + '_' +
                  connectivity + '_' + browser + '_' + view + '_' + metric + '_median value=' +
                  page.wpt[location][browser][connectivity][view][metric].v +
                  self.timeStamp;
              }
            });
          });
        });
      });
    });
  }

  return statistics;
};


InfluxdbCollector.prototype._getAssetsStats = function(page, urlKey) {

  var stats = '';

  if (this.config.graphiteData.indexOf('requests') > -1 || this.config.graphiteData.indexOf(
      'all') > -1) {
    if (page.har) {

      var self = this;
      var timings = ['blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive'];
      page.har.forEach(function(har) {

        har.log.entries.forEach(function(entry) {

          var url = entry.request.url;

          try {
            url = decodeURIComponent(entry.request.url);
          } catch (error) {
            self.log.info('Couldn\'t decode URI:' + entry.request.url);
          }

          var assetURL = util.getGraphiteURLKey(url, '_');

          // remove the last ., we need to rewrite the logic for the
          // keys
          if (assetURL.substr(-1) === '.') {
            assetURL = assetURL.slice(0, -1);
          }
          assetURL = assetURL.split(';').join('_')
          assetURL = assetURL.split('=').join('_')


          // TODO when we get the HAR from WPT we should include the browser, location
          // & connectivity in the key

          // get the timestamp from the HAR when the action happend
          var timeStamp = ' ' + Math.round(new Date(entry.startedDateTime).getTime() / 1000) + '\n';
          var total = 0;
          if (entry.timings) {
            timings.forEach(function(timing) {
              total += entry.timings[timing];
              stats += 'assets_timing,namespace=' + self.namespace + ',url=' + urlKey + ',asset_url=' + assetURL + ',timing=' + timing  + ' value=' +  entry.timings[timing] + timeStamp;
            });
            stats += 'assets_timing_total,namespace=' + self.namespace + ',url=' + urlKey + ',asset_url=' + assetURL +  ' value=' + total +  timeStamp;
          }
          // lets also add the size & type when we are here
          // we use the timestamp for the whole run to make sure
          // we only get one entry, this can and should be cleaned up later
          stats += 'assets_size,namespace=' + self.namespace + ',url=' + urlKey + ',asset_url=' + assetURL + ',content_type=' +
            util.getContentType(entry.response.content.mimeType) + ' value=' + entry.response.content.size + ' ' + self.timeStamp;

        });

      });
    }
  }
  return stats;
};

InfluxdbCollector.prototype._getDomainStats = function(domains, hostname) {

  var stats = '';
  if (domains) {

    var self = this;
    var timings = ['blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive', 'total'];
    var values = ['min', 'median', 'max'];


    domains.forEach(function(domain) {
      timings.forEach(function(timing) {
        values.forEach(function(value) {
          // TODO we should use the protovol also in the key right
          stats += 'summary_domains,namespace=' + self.namespace + value + ',hostname=' + hostname.split('.').join('_')  + ',domain=' + domain.domain.split('.').join('_') + ',timing=' + timing +
            ' value=' +util.getStatisticsObject(domain[timing].stats, 0)[value] + self.timeStamp;
        });
      });
      // and total time spent downloading
      stats += 'summary_domains,namespace=' + self.namespace + ',hostname=' + hostname.split('.').join('_')  + ',domain=' + domain.domain.split('.').join('_') + ',timing=totaltime' + ' value=' + domain.accumulatedTime + self.timeStamp;

      // the number of requests
      stats += 'summary_domains,namespace=' + self.namespace + ',hostname=' + hostname.split('.').join('_')  + ',domain=' + domain.domain.split('.').join('_') + ',timing=totalrequests' +  ' value=' + domain.count + self.timeStamp;
      // and the size, we only have the size for requests in the first HAR right now
      if (domain.size) {
        Object.keys(domain.size).forEach(function(size) {
//          stats += self.namespace + '.summary.' + hostname + '.domains.size.' + domain.domain.split('.').join('_') + '.' + size +
//            ' ' + domain.size[size] + self.timeStamp;
          stats += 'summary_domains_size,namespace=' + self.namespace + ',hostname=' + hostname.split('.').join('_')  + ',domain=' + domain.domain.split('.').join('_') + size  +' value=' + domain.size[size] + self.timeStamp;

        });
      }
    });
  }

  return stats;
};


InfluxdbCollector.prototype._getSummaryStats = function(aggregates, hostname, noOfPages) {
  var statistics = '';
  var self = this;
  var values = ['min', 'p10', 'median', 'mean', 'p90', 'p99', 'max', 'sum'];

  aggregates.forEach(function(aggregate) {
    values.forEach(function(value) {
      // special handling for WPT values for now
      if (aggregate.id.indexOf('WPT') > -1) {
        statistics += self.namespace + '.summary.' + hostname.split('.').join('_')  + '__' + aggregate.type + '.wpt.' +
          aggregate.key + '.' + value + ' ' + aggregate.stats[value] + self.timeStamp;

      }
      // catch navigation timings and separate them from the rest of the timings
      else if (navigationTimingNames.indexOf(aggregate.id) > -1) {
        statistics += 'summary_nagivationtiming,metric=' + aggregate.id + ',subtype=' + value + ',namespace=' +self.namespace + ',hostname=' + hostname.split('.').join('_')  + ' value=' + aggregate.stats[value] + self.timeStamp;
      } else {
        statistics += 'summary_' + aggregate.type + ',metric='+aggregate.id + ',subtype=' + value + ',hostname=' + hostname.split('.').join('_')  +
          ' value='  + aggregate.stats[value] + self.timeStamp;
      }
    });
  });

  // and add the number of runs
  statistics += 'summary_runsPerBrowser,hostname=' + hostname.split('.').join('_')  + ' value=' + this.config.no + this.timeStamp;

  // and number of tested pages per
  statistics += 'summary_noOfPages,hostname=' + hostname.split('.').join('_')  + ' value=' + noOfPages + this.timeStamp;

  return statistics;
};

module.exports = InfluxdbCollector;
