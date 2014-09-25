/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Stats = require('fast-stats').Stats;
var util = require('./util');
var timeMetrics = ['domainLookupTime', 'redirectionTime', 'serverConnectionTime', 'serverResponseTime',
  'pageDownloadTime', 'domInteractiveTime', 'domContentLoadedTime', 'pageLoadTime', 'frontEndTime', 'backEndTime'
];

function PhantomJSTiming() {
  var self = this;
  timeMetrics.forEach(function(metric) {
    self[metric] = new Stats();
  });
  this.runs = [];
}

PhantomJSTiming.prototype.add = function(phantomJSTimings) {
  var self = this;
  this.runs.push(phantomJSTimings);
  Object.keys(phantomJSTimings.timings).forEach(function(timing) {
    if (self.hasOwnProperty(timing)) {
      self[timing].push(phantomJSTimings.timings[timing]);
    }
  });

  if (phantomJSTimings.userTimings.marks) {
    phantomJSTimings.userTimings.marks.forEach(function(mark) {
      if (self.hasOwnProperty(mark.name)) {
        self[mark.name].push(mark.startTime);
      } else {
        self[mark.name] = new Stats().push(mark.startTime);
        timeMetrics.push(mark.name);
      }
    });
  }

};

PhantomJSTiming.prototype.getStats = function() {
  var result = [];
  var self = this;
  timeMetrics.forEach(function(metric) {
    result.push({
      id: metric,
      stats: util.getStatisticsObject(self[metric], 0),
      unit: 'milliseconds'
    });
  });

  return result;
};

module.exports = PhantomJSTiming;