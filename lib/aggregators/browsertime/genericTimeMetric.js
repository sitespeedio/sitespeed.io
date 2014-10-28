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
      var browser = runPerBrowser.browserName;
      browser = browser.charAt(0).toUpperCase() + browser.slice(1);
      runPerBrowser
        .data.forEach(function(run) {
          if (run.timings) {
            Object.keys(run.timings).forEach(function(metric) {
              if (timeMetrics.hasOwnProperty(metric)) {
                timeMetrics[metric].push(Number(run.timings[metric]));
              } else {
                timeMetrics[metric] = new Stats().push(Number(run.timings[metric]));
              } if (timeMetrics.hasOwnProperty(metric + browser)) {
                timeMetrics[metric + browser].push(Number(run.timings[metric]));
              } else {
                timeMetrics[metric + browser] = new Stats().push(Number(run.timings[metric]));
              }
            });
          }
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