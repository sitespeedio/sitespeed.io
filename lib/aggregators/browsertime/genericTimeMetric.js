/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Stats = require('fast-stats').Stats;
var util = require('../../util/util');
var timeMetrics = {};

// The aggregator id is used to print error messages. A better design for 'dynamic' aggregators is needed,
// but this will do for now.
exports.id = 'browsertimeTimeMetrics';

exports.processPage = function(pageData) {

  if (pageData.browsertime) {

    // extra timings from BrowserTime that we want to collect
    var extraTimings = ['speedIndex', 'firstPaint'];

    pageData.browsertime.browsertime.forEach(function(runPerBrowser) {
      var browser = runPerBrowser.browserName;
      browser = browser.charAt(0).toUpperCase() + browser.slice(1);
      runPerBrowser
        .default.data.forEach(function(run) {
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

          extraTimings.forEach(function(timing) {
            if (run[timing]) {
              if (timeMetrics.hasOwnProperty(timing)) {
                timeMetrics[timing].push(Number(run[timing]));
              } else {
                timeMetrics[timing] = new Stats().push(Number(run[timing]));
              }
              if (timeMetrics.hasOwnProperty(timing + browser)) {
                timeMetrics[timing + browser].push(Number(run[timing]));
              } else {
                timeMetrics[timing + browser] = new Stats().push(Number(run[timing]));
              }
            }
          });

          // and then fetch user timings if we have any!
          if (run.userTimings) {
            run.userTimings.marks.forEach(function(mark) {
              if (timeMetrics.hasOwnProperty(mark.name)) {
                timeMetrics[mark.name].push(Number(mark.startTime));
              } else {
                timeMetrics[mark.name] = new Stats().push(Number(mark.startTime));
              }
              if (timeMetrics.hasOwnProperty(mark.name + browser)) {
                timeMetrics[mark.name + browser].push(Number(mark.startTime));
              } else {
                timeMetrics[mark.name + browser] = new Stats().push(Number(mark.startTime));
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
