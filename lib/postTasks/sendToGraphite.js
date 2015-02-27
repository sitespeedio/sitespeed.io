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

    // this is a hack to only send max X domains to graphite and only the one
    // used the most.

    var sortedDomains = result.domains.sort(function(domain, domain2) {
      return domain2.count - domain.count;
    });

    if (sortedDomains.length > 100) {
      sortedDomains.length = 100;
    }

    var statistics = collector.collect(result.aggregates, result.pages, sortedDomains);
    sender.send(statistics, cb);
  } else {
    cb();
  }

};
