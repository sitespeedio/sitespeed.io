/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

var util = require('../util/util'),
  assets = {},
  RequestTiming = require('../requestTiming'),
  log = require('winston');

exports.processPage = function(pageData) {
  if (pageData.har) {
    var pageURL = util.getURLFromPageData(pageData);
    pageData.har.forEach(function(har) {
      har.log.entries.forEach(function(entry) {

        var asset = assets[entry.request.url];

        if (asset) {
          if (entry.timings) {
            var total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl +
              entry.timings
              .send + entry.timings.wait + entry.timings.receive;
            asset.timing.add(total, entry.request.url, pageURL);
          } else {
            log.log('info', 'Missing timings in the HAR');
          }
        } else {
          if (entry.timings) {
            var total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl +
              entry.timings
              .send + entry.timings.wait + entry.timings.receive;
            assets[entry.request.url] = {
              url: entry.request.url,
              timing: new RequestTiming(total, entry.request.url, pageURL),
              parent: util.getURLFromPageData(pageData)
            };
          }
        }
      });
    });
  }
}

exports.generateResults = function() {
  var values = Object.keys(assets).map(function(key) {
    return assets[key];
  });


  return {
    id: 'assetsByTiming',
    list: values
  };
};

exports.clear = function() {
  assets = {};
};