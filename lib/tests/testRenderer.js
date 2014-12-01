/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var JUnitTestSuites = require('./jUnitTestSuites'),
  tap = require('./tap'),
  async = require('async'),
  log = require('winston'),
  path = require('path');

function TestRenderer(config) {
  this.result = {};
  this.config = config;
  this.results = [];
  if (config.junit ||  config.tap) {
    if (config.budget) {
      log.log('info', 'Using configured web perf budget ' + JSON.stringify(this.budget));
      this.budget = config.budget;
    } else {
      this.budget = require('../../conf/budget.json');
      log.log('info', 'Using default web perf budget:' + JSON.stringify(this.budget));
    }
  }
  this.suites = new JUnitTestSuites(path.join(this.config.run.absResultDir, 'sitespeed.io.junit.xml'), this.config);

}

TestRenderer.prototype.forEachPage = function(url, pageData) {
  var self = this;

  var result = [this._yslow(url, pageData), , this._wpt(url, pageData),
    this._phantomJS(url, pageData),
    this._gpsi(url, pageData),
    this._browserTimings(url, pageData)
  ];

  result.forEach(function(r) {
    self._add(r);
  });

};

TestRenderer.prototype._add = function(result) {
  if (result.length > 0) {
    this.suites.addSuite(result[0].type, result);
  }
  this.results.push.apply(this.results, result);

};

TestRenderer.prototype._gpsi = function(url, pageData) {

  var results = [];

  if ((this.config.testData.indexOf('gpsi') > -1 || this.config.testData.indexOf(
    'all') > -1) && pageData.gpsi) {
    var defaultLimit = this.budget.gpsi.
    default ? this.budget.gpsi.
    score : 90;
    var result = {};
    result.title = ' GPSI score';
    result.url = url;
    result.isOK = pageData.gpsi.score > defaultLimit;
    result.description = ' The GPSI score is ' + pageData.gpsi.score +
      ' and the limit is ' + defaultLimit;
    result.value = pageData.gpsi.score;
    result.type = 'gpsi';
    results.push(result);
  }
  return results;
};

TestRenderer.prototype._browserTimings = function(url, pageData) {

  var results = [];
  if ((this.config.testData.indexOf('timings') > -1 || this.config.testData.indexOf(
    'all') > -1) && pageData.browsertime) {
    var self = this;
    Object.keys(this.budget.timings).forEach(function(timing) {
      pageData.browsertime.forEach(function(runPerBrowser) {
        var browser = runPerBrowser.browserName;
        var runs = runPerBrowser.runs;
        var browserVersion = runPerBrowser.browserVersion;
        runPerBrowser.statistics.forEach(function(stats) {
          if (stats.name === timing) {
            var result = {};
            result.title = timing + ' ' + browser;
            result.url = url;
            result.isOk = stats.median < self.budget.timings[timing];
            result.description = 'The time for ' + timing + ' is ' +
              stats.median + 'ms, that is higher that your limit of ' + self.budget.timings[timing] +
              ' ms. Using ' + browser + ' version ' + browserVersion +
              ' with the median of ' + runs + ' runs.';
            result.value = stats.median;
            result.type = 'timings';
            results.push(result);
          }
        });
      });
    });
  }
  return results;
};

TestRenderer.prototype._phantomJS = function(url, pageData) {
  var results = [];
  if ((this.config.testData.indexOf('timings') > -1 || this.config.testData.indexOf(
    'all') > -1) && pageData.phantomjs) {
    var self = this;
    Object.keys(this.budget.timings).forEach(function(timing) {

      var stats = pageData.phantomjs.getStats();
      stats.forEach(function(stat) {
        if (stat.id === timing) {
          var result = {};
          result.title = timing + ' using PhantomJS';
          result.url = url;
          result.isOk = stat.stats.median < self.budget.timings[timing];
          result.description = 'the ' + timing + '  is ' +
            stat.stats.median + ' threshold:' + self.budget.timings[timing];


          result.description = 'The time for ' + timing + ' is ' +
            stat.stats.median + 'ms, that is higher that your limit of ' + self.budget.timings[timing] +
            ' ms. Using PhantomJS ' +
            ' with the median of ' + pageData.phantomjs.runs.length + ' runs.';
          result.value = stats.median;

          result.value = stat.stats.median;
          result.type = 'timings';
          results.push(result);
        }
      });
    });
  }
  return results;
};

TestRenderer.prototype._wpt = function(url, pageData) {

  var results = [];
  if ((this.config.testData.indexOf('wpt') > -1 || this.config.testData.indexOf(
    'all') > -1) && pageData.webpagetest) {
    var self = this;
    // TODO depending on how many runs we do
    var median = pageData.webpagetest.response.data.median.firstView;

    Object.keys(this.budget.wpt).forEach(function(key) {
      var result = {};
      result.title = 'WPT ' + key;
      result.url = url;
      result.isOk = median[key] < self.budget.wpt[key];
      result.description = 'The median ' + key + ' is ' + median[key] +
        ' and the threshold is set to ' + self.budget.wpt[key];
      result.value = median[key];
      result.type = 'wpt';
      results.push(result);
    });
  }
  return results;
};

TestRenderer.prototype._yslow = function(url, pageData) {

  var results = [];
  if ((this.config.testData.indexOf('rules') > -1 || this.config.testData.indexOf(
    'all') > -1) && pageData.yslow) {

    var rules = pageData.yslow.g;
    var ruleDictionary = pageData.yslow.dictionary.rules;
    var rule = Object.keys(rules);
    var self = this;
    var defaultLimit = this.budget.rules.default ? this.budget.rules.default : 90;

    for (var i = 0; i < rule.length; i++) {
      var score = rules[rule[i]].score;
      var result = {};
      // is this skippable?
      if (self.config.skipTest) {
        if (self.config.skipTest.indexOf(rule[i]) > -1) {
          result.title = rule[i] + ' :' + ruleDictionary[rule[i]].name;
          result.url = url;
          result.skipped = true;
          result.description = 'Skipping ' + rule[i] + ' score ' + score;
          result.value = score;
          result.type = 'rule';
          results.push(result);
          continue;
        }
      }
      result.title = rule[i] + ' :' + ruleDictionary[rule[i]].name;
      result.url = url;
      result.isOk = score > defaultLimit;
      result.description = 'The ' + rule[i] + ' has the score ' + score;
      result.value = score;
      result.components = rules[rule[i]].components;
      result.type = 'rule';
      results.push(result);
    }
  }
  return results;
};


TestRenderer.prototype.render = function(cb) {
  var self = this;

  async.parallel({
      writeTap: function(callback) {
        if (self.config.tap) {
          tap.writeTap(self.results, callback);
        } else {
          callback();
        }
      },
      writeJUnit: function(callback) {
        if (self.config.junit) {
          self.suites.render(callback);
        } else {
          callback();
        }
      }
    },
    function(err, results) {
      cb();
    });
};


module.exports = TestRenderer;
