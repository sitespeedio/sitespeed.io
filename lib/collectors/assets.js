/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var util = require('../util/util'),
    yslowUtil = require('../util/yslowUtil');
var assets = {};

exports.processPage = function(pageData) {
  if (pageData.yslow) {
    pageData.yslow.comps.forEach(function(comp) {
      if (comp.type !== 'doc') {
        var url = comp.url;
        var asset = assets[url];

        if (asset) {
          asset.count++;
        } else {
          assets[url] = {
            url: url,
            type: comp.type,
            timeSinceLastModification: yslowUtil.getTimeSinceLastMod(comp),
            cacheTime: yslowUtil.getCacheTime(comp),
            size: comp.size,
            count: 1,
            headers: comp.headers,
            parent: util.getURLFromPageData(pageData)

          };
        }
      }
    });
  }
};

exports.generateResults = function() {
  var values = Object.keys(assets).map(function(key) {
    return assets[key];
  });

  return {
    id: 'assets',
    list: values
  };
};

exports.clear = function() {
  assets = {};
};
