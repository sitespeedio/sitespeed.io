/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var util = require('./util/util'),
  log = require('winston'),
  net = require('net');

function Graphite(host, port, namespace, config) {
  this.host = host;
  this.port = port;
  this.namespace = namespace;
  this.config = config;
}

Graphite.prototype.sendPageData = function(aggregates, pages, config, cb) {

  var self = this;
  var statistics = '';

  var timeStamp = ' ' + Math.round(new Date().getTime() / 1000) + '\n';

  var namespace = this.namespace;
  pages.forEach(function(page) {
    statistics += self._getPageStats(page, namespace, timeStamp);
  });

  if (this.config.graphiteData.indexOf('summary') > -1 || this.config.graphiteData.indexOf(
    'all') > -1) {
    statistics += this._getSummaryStats(aggregates, namespace, config.urlObject.hostname, timeStamp);
  }

  var server = net.createConnection(this.port, this.host);
  server.addListener('error', function(connectionException) {
    log.log('error', 'Couldnt send data to Graphite:' + connectionException + ' for host:' + self.host + ' port:' +
      self.port);
  });

  server.on('connect', function() {
    log.log('info', 'Sending data to Graphite ...');
    this.write(statistics);
    this.end();
    // log.log('info', 'Data sent to Graphite');
    cb();
  });

};

Graphite.prototype._getSummaryStats = function(aggregates, namespace, hostname, timeStamp) {
  var statistics = '';
  var values = ['min', 'p10', 'median', 'mean', 'p90', 'p99', 'max'];

  aggregates.forEach(function(aggregate) {
    values.forEach(function(value) {
      statistics += namespace + '.summary.' + hostname + '.' + aggregate.type + '.' + aggregate.id +
        '.' +
        value +
        ' ' +
        aggregate.stats[value] + timeStamp;
    });
  });
  return statistics;
};

Graphite.prototype._getPageStats = function(page, namespace, timeStamp) {

  var self = this;
  var statistics = '';
  // timings
  var timingsWeWillPush = ['min', 'median', 'p90', 'max'];
  var urlKey = util.getGraphiteURLKey(decodeURIComponent(page.url));

  // Get all rule data
  if (this.config.graphiteData.indexOf('rules') > -1 || this.config.graphiteData.indexOf(
    'all') > -1) {
    Object.keys(page.rules).forEach(function(rule) {
      statistics += namespace + '.' + urlKey + 'rules.' + rule + ' ' +
        page.rules[rule].v + timeStamp;
    });
  }

  // the timings that are not browser specific
  if (this.config.graphiteData.indexOf('timings') > -1 || this.config.graphiteData.indexOf(
    'all') > -1) {
    // check that we actually collect browser data
    if (page.timings) {
      Object.keys(page.timings).forEach(function(timing) {
        timingsWeWillPush.forEach(function(val) {
          // is it a browser?
          if (self.config.supportedBrowsers.indexOf(timing) < 0) {
            statistics += namespace + '.' + urlKey + 'timings.' + timing +
              '.' + val + ' ' + page.timings[timing][val].v + timeStamp;
          }
        });
      });

      // and the browsers
      Object.keys(page.timings).forEach(function(browser) {
        if (self.config.supportedBrowsers.indexOf(browser) > -1) {
          Object.keys(page.timings[browser]).forEach(function(timing) {
            timingsWeWillPush.forEach(function(val) {
              statistics += namespace + '.' + urlKey + 'timings.' +
                browser + '.' + timing + '.' + val + ' ' + page.timings[
                  browser][timing][val].v + timeStamp;
            });
          });
        }
      });
    }
  }


  if (this.config.graphiteData.indexOf('pagemetrics') > -1 || this.config.graphiteData.indexOf(
    'all') > -1) {
    // and all the assets
    if (page.yslow) {
      Object.keys(page.yslow.assets).forEach(function(asset) {
        statistics += namespace + '.' + urlKey + 'assets.' + asset +
          ' ' + page.yslow.assets[asset].v + timeStamp;
      });

      // and page specific
      statistics += namespace + '.' + urlKey + 'score' + ' ' + page.score +
        timeStamp;
      statistics += namespace + '.' + urlKey + 'requests' + ' ' + page.yslow
        .requests.v + timeStamp;
      statistics += namespace + '.' + urlKey + 'requestsMissingExpire' +
        ' ' + page.yslow.requestsMissingExpire.v + timeStamp;
      statistics += namespace + '.' + urlKey +
        'timeSinceLastModification' + ' ' + page.yslow.timeSinceLastModification
        .v + timeStamp;
      statistics += namespace + '.' + urlKey + 'cacheTime' + ' ' + page.yslow
        .cacheTime.v + timeStamp;
    }
  }

  // add gspi score
  if (page.gpsi) {
    statistics += namespace + '.' + urlKey + 'gpsi' + ' ' + page.gpsi.gscore.v + timeStamp;
  }

  // add wpt data
  if (page.wpt) {
    Object.keys(page.wpt).forEach(function(view) {
      Object.keys(page.wpt[view]).forEach(function(metric) {
        statistics += namespace + '.' + urlKey + 'wpt.median.' + view + '.' + metric + ' ' + page.wpt[view][metric]
          .v +
          timeStamp;
      });
    });
  }

  return statistics;

};

module.exports = Graphite;