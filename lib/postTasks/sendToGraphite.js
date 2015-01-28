/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict'; 
var Graphite = require('../graphite');

exports.task = function(result, config, cb) {
  if (config.graphiteHost) {
    var graphite = new Graphite(config.graphiteHost, config.graphitePort, config
      .graphiteNamespace, config);

    graphite.sendPageData(result.aggregates, result.pages, config, cb);
  } else {
    cb();
  }

};
