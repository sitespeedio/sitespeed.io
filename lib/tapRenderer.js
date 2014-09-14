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
}

TapRenderer.prototype.forEachPage = function(url, pageData) {

  if (!this.hasStream) {
  var outStream = fs.createWriteStream(path.join(this.config.run.absResultDir, 'sitespeed.tap'));
  tap.createStream().pipe(outStream);
  this.hasStream = true;
  }

  var rules = pageData.yslow.g;
  var rule = Object.keys(rules);
  var self = this;

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

      var limit = -1;
      if (self.config.thresholds) {
        if (self.config.thresholds.hasOwnProperty(rule[i])) {
          limit = self.config.thresholds[rule[i]];
        } else {
          limit = self.config.threshold;
        }
      } else {
        limit = self.config.threshold;
      }

      if (limit > -1) {
        t.ok(score > limit, 'the ' + rule[i] + ' score is:' + score);
      }
    }
    t.end();
  });

};

TapRenderer.prototype.render = function(cb) {
  // what should we do when we are finished
  cb();
};


module.exports = TapRenderer;
