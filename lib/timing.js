/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Stats = require('fast-stats').Stats;
var util = require('../util');
var timeMetrics = ['domainLookupTime', 'redirectionTime', 'serverConnectionTime', 'serverResponseTime',
  'pageDownloadTime', 'domInteractiveTime', 'pageLoadTime', 'frontEndTime', 'backEndTime'
];


function Timing() {
  timeMetrics.forEach(function(metric) {
    this[metric] = new Stats();
  });
  this.runs = [];
}

Timing.prototype.add = function(phantomJSTimings) {

  this.runs.push(phantomJSTimings);
  Object.keys(phantomJSTimings.timings).forEach(function(timing) {
    if (this.hasOwnProperty(timing)) {
      this[timing].push(phantomJSTimings.timings[timing]);
    }
  });

  if (phantomJSTimings.userTimings.marks) {
    phantomJSTimings.userTimings.marks.forEach(function(mark) {
      if (this.hasOwnProperty(mark.name)) {
        this[mark.name].push(mark.startTime);
      } else {
        this[mark.name] = new Stats().push(mark.startTime);
        timeMetrics.push(mark.name);
      }
    });
  }

};

Timing.prototype.getStats = function() {
  var result = [];

  timeMetrics.forEach(function(metric) {
    result.push({
      id: metric,
      stats: util.getStatisticsObject(this[metric], 0),
      unit: 'milliseconds'
    });
  });

  return result;
};

module.exports = Timing;
