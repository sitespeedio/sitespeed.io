/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var JUnitTestSuites = require('./jUnitTestSuites'),
  tap = require('./tap'),
  async = require('async'),
  path = require('path');

function TestRenderer(config) {
  this.result = {};
  this.config = config;
  this.results = [];
  if (config.thresholdFile) {
    this.thresholds = require(config.thresholdFile);
  } else {
    this.thresholds = require('../../conf/testThresholds.json');
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

}

TestRenderer.prototype._gpsi = function(url, pageData) {

  var results = [];

  if (pageData.gpsi && this.thresholds.gpsi) {

    var defaultLimit = this.thresholds.gpsi.
    default ? this.thresholds.gpsi.
    score : 90;
    var result = {};
    result.title = 'score';
    result.url = url;
    result.isOK = pageData.gpsi.score > defaultLimit;
    result.description = 'the gpsi score is ' + pageData.gpsi.score +
      ' threshold:' + defaultLimit;
    result.value = pageData.gpsi.score;
    result.type = 'gpsi';
    results.push(result);
  }
  return results;
};

TestRenderer.prototype._browserTimings = function(url, pageData) {

  var results = [];
  if (pageData.browsertime && this.thresholds.timings) {
    var self = this;
    Object.keys(this.thresholds.timings).forEach(function(timing) {
      pageData.browsertime.forEach(function(runPerBrowser) {
        var browser = runPerBrowser.pageData.browserName;
        runPerBrowser.statistics.forEach(function(stats) {
          if (stats.name === timing) {
            var result = {};
            result.title = browser + ' ' + timing;
            result.url = url;
            result.isOk = stats.median < self.thresholds.timings[timing];
            result.description = 'the' + timing + '  is ' +
              stats.median + ' threshold:' + self.thresholds.timings[timing];
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
  if (pageData.phantomjs && this.thresholds.timings) {
    var self = this;
    Object.keys(this.thresholds.timings).forEach(function(timing) {

      var stats = pageData.phantomjs.getStats();
      stats.forEach(function(stat) {
        if (stat.id === timing) {
          var result = {};
          result.title = timing;
          result.url = url;
          result.isOk = stat.stats.median < self.thresholds.timings[timing];
          result.description = 'the ' + timing + '  is ' +
            stat.stats.median + ' threshold:' + self.thresholds.timings[timing];
          result.value = stat.stats.median;
          result.type = 'phantomjs';
          results.push(result);
        }
      });
    });
  }
  return results;
};

TestRenderer.prototype._wpt = function(url, pageData) {

  var results = [];
  if (pageData.webpagetest && this.thresholds.wpt) {
    var self = this;
    // TODO depending on how many runs we do
    var median = pageData.webpagetest.response.data.median.firstView;

    Object.keys(this.thresholds.wpt).forEach(function(key) {
      var result = {};
      result.title = key + ' ' + url;
      result.url = url;
      result.isOk = median[key] < self.thresholds.wpt[key];
      result.description = 'the median ' + key + '  is ' + median[key] +
        ' threshold ' + self.thresholds.wpt[key];
      result.value = median[key];
      result.type = 'wpt';
      results.push(result);
    });
  }
  return results;
};

TestRenderer.prototype._yslow = function(url, pageData) {

  var results = [];
  if (pageData.yslow && this.thresholds.yslow) {

    var rules = pageData.yslow.g;
    var ruleDictionary = pageData.yslow.dictionary.rules;
    var rule = Object.keys(rules);
    var self = this;
    var defaultLimit = this.thresholds.yslow.
    default ? this.thresholds.yslow.
    default : 90;

    for (var i = 0; i < rule.length; i++) {
      var score = rules[rule[i]].score;

      // is this skippable?
      if (self.config.skipTest) {
        if (self.config.skipTest.indexOf(rule[i]) > -1) {
          var result = {};
          result.title = '(' + rule[i] + ') ' + ruleDictionary[rule[i]].name;
          result.url = url;
          result.skipped = true;
          result.description = 'Skipping ' + rule[i] + ' score ' + score;
          result.value = score;
          results.push(result);
          result.type = 'rule';
          continue;
        }
      }
      var result = {};
      result.title = '(' + rule[i] + ') ' + ruleDictionary[rule[i]].name;
      result.url = url;
      result.isOk = score > defaultLimit;
      result.description = 'The ' + rule[i] + ' has the score ' + score;
      result.value = score;
      result.type = 'rule';
      results.push(result);
    }
  }
  return results;

}


TestRenderer.prototype.render = function(cb) {
  var self = this;

  async.parallel({
      writeTap: function(callback) {
        if (self.config.tap) {
          tap.writeTap(path.join(self.config.run.absResultDir, 'sitespeed.tap'), self.results, callback);
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