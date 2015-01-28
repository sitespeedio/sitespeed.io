/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var fs = require('fs-extra'),
  path = require('path'),
  winston = require('winston'),
  inspect = require('util').inspect;

function Collector(config) {
  this.aggregators = [];
  this.collectors = [];
  this.log = winston.loggers.get('sitespeed.io');
  registerAggregators(config, this.aggregators);
  registerCollectors(config, this.collectors);
}

function registerAggregators(config, aggregators) {
  if (config.runYslow) {
    loadStandardAggregators('yslow');
    loadStandardAggregators('headless');
  }
  if (config.browser) {
    loadStandardAggregators('browsertime');
  }
  if (config.gpsiKey) {
    loadStandardAggregators('gpsi');
  }
  if (config.wptHost) {
    loadStandardAggregators('webpagetest', function(fileName) {
      return !(config.wptConfig && config.wptConfig.firstViewOnly && (fileName.indexOf('repeatView') === 0));
    });
  }

  if (config.browser || config.wptHost) {
    loadStandardAggregators('har');
  }

  if (config.aggregators) {
    loadAggregators(config.aggregators);
  }

  function loadStandardAggregators(subFolder, filter) {
    var rootPath = path.join(__dirname, 'aggregators', subFolder);
    loadAggregators(rootPath, filter);
  }

  function loadAggregators(folder, filter) {
    filter = filter || function() { return true; };

    fs.readdirSync(folder).forEach(function(fileName) {
      if (filter(fileName)) {
        aggregators.push(require(path.join(folder, fileName)));
      }
    });
  }

}

function registerCollectors(config, collectors) {
  loadCollectors(path.join(__dirname, 'collectors'));

  if (config.collectors) {
    loadCollectors(config.collectors);
  }

  function loadCollectors(folder) {
    fs.readdirSync(folder).forEach(function(file) {
      collectors.push(require(path.join(folder, file)));
    });
  }
}

Collector.prototype.createAggregates = function() {
  var aggregates = [];
  var log = this.log;
  this.aggregators.forEach(function(a) {
    // if one of the values fails, we want to log & move on
    try {
      aggregates = aggregates.concat(a.generateResults());
    } catch (err) {
      log.error('Could not fetch data for aggregator: %s err: %s', a.id, inspect(err));
    }

  });
  return aggregates;
};

Collector.prototype.clear = function() {

  this.collectors.forEach(function(c) {
    c.clear();
  });

  this.aggregators.forEach(function(a) {
    a.clear();
  });

};

Collector.prototype.createCollections = function() {
  var collections = {};

  this.collectors.forEach(function(c) {
    var collection = c.generateResults();
    collections[collection.id] = collection.list;
  });
  return collections;
};

Collector.prototype.collectPageData = function(pageData) {
  var log = this.log;
  this.aggregators.forEach(function(a) {
    try {
      a.processPage(pageData);

    } catch (err) {
      log.error('Could not fetch data for aggregator: %s: err: %s', a.id, inspect(err));
    }
  });

  this.collectors.forEach(function(c) {
    c.processPage(pageData);
  });

};

module.exports = Collector;
