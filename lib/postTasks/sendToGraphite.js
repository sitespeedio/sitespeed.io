/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var GraphiteSender = require('../graphite/graphiteSender'),
GraphiteCollector = require('../graphite/graphiteCollector');

exports.task = function(result, config, cb) {
  if (config.graphiteHost) {

    var sender = new GraphiteSender(config.graphiteHost, config.graphitePort, config);
    var collector = new GraphiteCollector(config);

    var statistics = collector.collect(result.aggregates, result.pages, result.domains);
    sender.send(statistics, cb);
  } else {
    cb();
  }

};
