/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Stats = require('fast-stats').Stats;
var util = require('../../util/util');
var timeMetrics = {};

exports.processPage = function(pageData) {

  if (pageData.browsertime) {
    pageData.browsertime.forEach(function(runPerBrowser) {
      var browser = runPerBrowser.pageData.browserName;
      browser = browser.charAt(0).toUpperCase() + browser.slice(1);
      runPerBrowser.timingRuns.forEach(function(run) {
        run.measurements.forEach(function(metric) {
          if (timeMetrics.hasOwnProperty(metric.name)) {
            timeMetrics[metric.name].push(Number(metric.duration));
          } else {
            timeMetrics[metric.name] = new Stats().push(Number(metric.duration));
          }
          if (timeMetrics.hasOwnProperty(metric.name + browser)) {
            timeMetrics[metric.name + browser].push(Number(metric.duration));
          } else {
            timeMetrics[metric.name + browser] = new Stats().push(Number(metric.duration));
          }
        });
      });
    });
  }
};


exports.generateResults = function() {
  var keys = Object.keys(timeMetrics),
    result = [];

  for (var i = 0; i < keys.length; i++) {
    result.push({
      id: keys[i],
      title: keys[i],
      desc: util.timingMetricsDefinition[keys[i]] || 'User Timing API metric',
      type: 'timing',
      stats: util.getStatisticsObject(timeMetrics[keys[i]], 0),
      unit: 'milliseconds'
    });
  }

  return result;
};

exports.clear = function() {
  timeMetrics = {};
};