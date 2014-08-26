/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Stats = require('fast-stats').Stats;
var util = require('../../util');
var timeMetrics = {};

exports.processPage = function(pageData) {

  if (pageData.phantomjs) {
    // The Navigation timing API
    Object.keys(pageData.phantomjs.timings).forEach(function(metric) {
      if (timeMetrics.hasOwnProperty(metric)) {
        timeMetrics[metric].push(Number(pageData.phantomjs.timings[metric]));
      } else {
        timeMetrics[metric] = new Stats();
        timeMetrics[metric].push(Number(pageData.phantomjs.timings[metric]));
      }
    });

    // handle User Timing API
    if (pageData.phantomjs.userTimings.marks) {
      pageData.phantomjs.userTimings.marks.forEach(function(mark) {
        if (timeMetrics.hasOwnProperty(mark.name)) {
          timeMetrics[mark.name].push(Number(mark.startTime));
          timeMetrics[mark.name+'PhantomJS'].push(Number(mark.startTime));
        } else {
          timeMetrics[mark.name] = new Stats();
          timeMetrics[mark.name+'PhantomJS'] = new Stats();
          timeMetrics[mark.name].push(Number(mark.startTime));
          timeMetrics[mark.name+'PhantomJS'].push(Number(mark.startTime));
        }

      });
    }
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
      stats: util.getStatisticsObject(timeMetrics[keys[i]], 0),
      unit: 'milliseconds'
    });
  }

  return result;
};

exports.clear = function() {
  timeMetrics = {};
};
