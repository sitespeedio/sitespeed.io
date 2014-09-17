/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var tap = require('tape'),
  fs = require('fs-extra'),
  path = require('path');

function TapRenderer(config) {
  this.result = {};
  this.config = config;
  this.hasStream = false;
  this.defaultThresholds = require('../conf/thresholds.json');
}

TapRenderer.prototype.forEachPage = function(url, pageData) {

  if (!this.hasStream) {
    var outStream = fs.createWriteStream(path.join(this.config.run.absResultDir, 'sitespeed.tap'));
    tap.createStream().pipe(outStream);
    this.hasStream = true;
  }

  this._yslow(url, pageData);
  this._wpt(url, pageData);
  this._phantomJS(url, pageData);
  this._gpsi(url, pageData);
  this._browserTimings(url, pageData);
};


TapRenderer.prototype._gpsi = function(url, pageData) {
  if (pageData.gpsi) {

    var defaultLimit = this.defaultThresholds.gpsi.
    default ? this.defaultThresholds.gpsi.
    score : 90;

    tap('gpsi score ' + url, function(t) {
      t.ok(pageData.gpsi.score > defaultLimit, 'the gpsi score is ' + pageData.gpsi.score +
        ' threshold:' + defaultLimit);
      t.end();
    });

  }
};

TapRenderer.prototype._browserTimings = function(url, pageData) {
  var self = this;
  if (pageData.browsertime) {

    Object.keys(this.defaultThresholds.timings).forEach(function(timing) {
      pageData.browsertime.forEach(function(runPerBrowser) {
        var browser = runPerBrowser.pageData.browserName;
        runPerBrowser.statistics.forEach(function(stats) {
          if (stats.name === timing) {
            tap('timings ' + browser + ' ' + timing + ' ' + url, function(t) {
              t.ok(stats.median < self.defaultThresholds.timings[timing], 'the' + timing + '  is ' +
                stats.median + ' threshold:' + self.defaultThresholds.timings[timing]);
              t.end();
            });
          }
        });
      });
    });
  }
};

TapRenderer.prototype._phantomJS = function(url, pageData) {
  var self = this;
  if (pageData.phantomjs) {
    Object.keys(this.defaultThresholds.timings).forEach(function(timing) {

      var stats = pageData.phantomjs.getStats();
      stats.forEach(function(stat) {
        if (stat.id === timing) {
          tap('phantomJS ' + timing + ' ' + url, function(t) {
            t.ok(stat.stats.median < self.defaultThresholds.timings[timing], 'the ' + timing + '  is ' +
              stat.stats.median + ' threshold:' + self.defaultThresholds.timings[timing]);
            t.end();
          });
        }
      });
    });
  }
};

TapRenderer.prototype._wpt = function(url, pageData) {

  var self = this;

  if (pageData.webpagetest) {
    // TODO depending on how many runs we do
    var median = pageData.webpagetest.response.data.median.firstView;

    Object.keys(this.defaultThresholds.wpt).forEach(function(key) {

      tap('wpt ' + key + ' ' + url, function(t) {
        t.ok(median[key] < self.defaultThresholds.wpt[key], 'the median ' + key + '  is ' + median[key] +
          ' threshold ' + self.defaultThresholds.wpt[key]);
        t.end();
      });

    });
  }
};

TapRenderer.prototype._yslow = function(url, pageData) {

  var rules = pageData.yslow.g;
  var rule = Object.keys(rules);
  var self = this;
  var defaultLimit = this.defaultThresholds.yslow.
  default ? this.defaultThresholds.yslow.
  default : 90;

  tap('yslow ' + url, function(t) {
    for (var i = 0; i < rule.length; i++) {
      var score = rules[rule[i]].score;

      // is this skippable?
      if (self.config.skipTest) {
        if (self.config.skipTest.indexOf(rule[i]) > -1) {
          t.skip('Skipping ' + rule[i] + ' score ' + score);
          continue;
        }
      }

      t.ok(score > defaultLimit, 'the ' + rule[i] + ' score is:' + score);
    }
    t.end();
  });

}


TapRenderer.prototype.render = function(cb) {
  // what should we do when we are finished
  cb();
};


module.exports = TapRenderer;
