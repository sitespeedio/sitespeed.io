/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var fs = require('fs-extra'),
  path = require('path'),
  log = require('winston'),
  aggregators = {},
  collectors = [],
  types = [];

function Collector(config) {
  registerAggregators(config);
  registerCollectors(config);
}

function registerAggregators(config) {

  if (config.runYslow) {
    types.push('yslow');
    types.push('phantomjs');
  }
  if (config.browser) {
    types.push('browsertime', 'har');
  }
  if (config.gpsiKey) {
    types.push('gpsi');
  }
  if (config.wptUrl) {
    types.push('webpagetest');
  }

  types.forEach(function(type) {
    aggregators[type] = [];
    var rootPath = path.join(__dirname, 'aggregators', type, path.sep);
    fs.readdirSync(rootPath).forEach(function(file) {
      aggregators[type].push(require(rootPath + file));
    });
  });

  if (config.aggregators) {
    aggregators['user'] = [];
    fs.readdirSync(config.aggregators).forEach(function(file) {
      aggregators['user'].push(require(config.aggregators + file));
    });
  }
}

function registerCollectors(config) {
  var rootPath = path.join(__dirname, 'collectors', path.sep);
  fs.readdirSync(rootPath).forEach(function(file) {
    collectors.push(require(rootPath + file));
  });
  if (config.collectors) {
    fs.readdirSync(config.collectors).forEach(function(file) {
      collectors.push(require(config.collectors + file));
    });
  }
}

Collector.prototype.createAggregates = function() {
  var aggregates = {};
  types.forEach(function(type) {
    aggregates[type] = [];
    aggregators[type].forEach(function(a) {
      // if one of the values fails, we want to log & move on
      try {
        var result = a.generateResults();
        if (Array.isArray(result)) {
          result.forEach(function(b) {
            aggregates[type].push(b);
          });
        } else {
          aggregates[type].push(result);
        }
      } catch (err) {
        log.log('error', 'Could not fetch data for aggregator:' + a.id + ' err:' + err);
      }

    });

  });
  return aggregates;
};

Collector.prototype.clear = function() {

  collectors.forEach(function(c) {
    c.clear();
  });

  types.forEach(function(type) {
    aggregators[type].forEach(function(a) {
      a.clear();
    });

  });

};

Collector.prototype.createCollections = function() {
  var collections = {};

  collectors.forEach(function(c) {
    var collection = c.generateResults();
    collections[collection.id] = collection.list;
  });
  return collections;
};

Collector.prototype.collectPageData = function(pageData) {

  types.forEach(function(type) {
    aggregators[type].forEach(function(a) {
      try {
        a.processPage(pageData);

      } catch (err) {
        log.log('error', 'Could not fetch data for aggregator:' + a.id + ' err:' +
          err);
      }
    });

  });

  collectors.forEach(function(c) {
    c.processPage(pageData);
  });

};

module.exports = Collector;