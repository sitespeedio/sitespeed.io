/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var util = require('./util'),
  net = require('net');

// TODO we should do this more generic, so we can push gpsi & wpt or whatever in the future

function Graphite(host, port, namespace, collector, config) {
  this.host = host;
  this.port = port;
  this.namespace = namespace;
  this.collector = collector;
  this.config = config;
}

Graphite.prototype.sendPageData = function(aggregates,pages, cb) {

  var statistics = '';

  var timeStamp = ' ' + Math.round(new Date().getTime() / 1000) + '\n';

  var namespace = this.namespace;
  pages.forEach(function(page) {
    statistics += getPageStats(page, namespace, timeStamp, this.config);
  });

  if (this.config.graphiteData.indexOf('summary') > -1 || this.config.graphiteData.indexOf(
    'all') > -1) {
    statistics += getSummaryStats(aggregates, namespace, timeStamp);
  }

  var server = net.createConnection(this.port, this.host);
  server.addListener('error', function(connectionException) {
    console.log('Couldnt send data to Graphite:' + connectionException);
    cb();
  });

  server.on('connect', function() {
    console.log('Sending to Grahite ...');
    this.write(statistics);
    this.end();
    console.log('Data sent to Graphite');
    cb();
  });

};

function getSummaryStats(aggregates, namespace, timeStamp) {
  var statistics = '';
  var values = ['min', 'p10', 'median', 'mean', 'p90', 'p99', 'max'];
  aggregates.forEach(function(aggregate) {
    values.forEach(function(value) {
      statistics += namespace + '.summary.' + aggregate.id + '.' + value +
        ' ' +
        aggregate.stats[value] + timeStamp;
    });
  });
  return statistics;
}

function getPageStats(page, namespace, timeStamp, config) {

  var statistics = '';
  // timings
  var timingsWeWillPush = ['min', 'median', 'p90', 'max'];
  var urlKey = util.getGraphiteURLKey(decodeURIComponent(page.url));

  // Get all rule data
  if (config.graphiteData.indexOf('rules') > -1 || config.graphiteData.indexOf(
    'all') > -1) {
    Object.keys(page.rules).forEach(function(rule) {
      statistics += namespace + '.' + urlKey + 'rules.' + rule + ' ' +
        page.rules[rule].v + timeStamp;
    });
  }

  // the timings that are not browser specific
  if (config.graphiteData.indexOf('timings') > -1 || config.graphiteData.indexOf(
    'all') > -1) {
    Object.keys(page.timings).forEach(function(timing) {
      timingsWeWillPush.forEach(function(val) {
        // is it a browser?
        if (config.supportedBrowsers.indexOf(timing) < 0) {
          statistics += namespace + '.' + urlKey + 'timings.' + timing +
            '.' + val + ' ' + page.timings[timing][val].v + timeStamp;
        }
      });
    });


    // and the browsers
    Object.keys(page.timings).forEach(function(browser) {
      if (config.supportedBrowsers.indexOf(browser) > -1) {
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


  if (config.graphiteData.indexOf('pagemetrics') > -1 || config.graphiteData.indexOf(
    'all') > -1) {
    // and all the assets
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
  return statistics;

}

module.exports = Graphite;
