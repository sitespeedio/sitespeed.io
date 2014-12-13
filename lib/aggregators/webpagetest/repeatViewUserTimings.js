/**
* Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
* Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
* and other contributors
* Released under the Apache 2.0 License
*/
var Stats = require('fast-stats').Stats;
var util = require('../../util/util');
var userTimings = {};

exports.processPage = function(pageData) {
  if (pageData.webpagetest) {
    pageData.webpagetest.wpt.response.data.run.forEach(function(run) {
      if (run.repeatView.results.userTimes) {
        Object.keys(run.repeatView.results.userTimes).forEach(function(userTiming) {
          if (userTimings.hasOwnProperty(userTiming)) {
            userTimings[userTiming].push(Number(run.repeatView.results.userTimes[userTiming]));
          }
          else {
            userTimings[userTiming] = new Stats().push(Number(run.repeatView.results.userTimes[userTiming]));
          }
        });
      }

    });
  }
};


exports.generateResults = function() {
  var keys = Object.keys(userTimings),
  result = [];

  for (var i = 0; i < keys.length; i++) {
    result.push({
      id: 'repeatView' + keys[i] + 'WPT',
      title: keys[i] + ' repeat view',
      desc: 'User Timing API metric',
      type: 'timing',
      stats: util.getStatisticsObject(userTimings[keys[i]], 0),
      unit: 'milliseconds'
    });
  }

  return result;
};

exports.clear = function() {
  userTimings = {};
};
