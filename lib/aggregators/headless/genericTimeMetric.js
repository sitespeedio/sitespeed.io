/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var Stats = require('fast-stats').Stats,
    util = require('../../util/util');
var timeMetrics = {};

// The aggregator id is used to print error messages. A better design for 'dynamic' aggregators is needed,
// but this will do for now.
exports.id = 'headlessTimeMetrics';

exports.processPage = function(pageData) {

  if (pageData.headless) {

    pageData.headless.runs.forEach(function(run) {

      // The Navigation timing API
      Object.keys(run.timings).forEach(function(metric) {
        if (timeMetrics.hasOwnProperty(metric + 'Headless')) {
          timeMetrics[metric + 'Headless'].push(Number(run.timings[metric]));
        } else {
          timeMetrics[metric + 'Headless'] = new Stats().push(Number(run.timings[metric]));
        }
      });

      // handle User Timing API
      if (run.userTimings.marks) {
        run.userTimings.marks.forEach(function(mark) {
          if (timeMetrics.hasOwnProperty(mark.name + 'Headless')) {
            timeMetrics[mark.name + 'Headless'].push(Number(mark.startTime));
          } else {
            timeMetrics[mark.name + 'Headless'] = new Stats().push(Number(mark.startTime));
          }
        });
      }


    });

    /*

    */
  }
};

exports.generateResults = function() {
  var keys = Object.keys(timeMetrics),
    result = [];

  for (var i = 0; i < keys.length; i++) {
    result.push({
      id: keys[i],
      title: keys[i],
      desc: util.timingMetricsDefinition[keys[i]] ||
        'User Timing API metric',
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
