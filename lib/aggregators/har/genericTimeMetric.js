/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Stats = require('fast-stats').Stats;
var util = require('../../util/util');
var timeMetrics = {};

var descriptions = {};
descriptions.blocked = 'Time spent in a queue waiting for a network connection';
descriptions.dns = 'The time required to resolve a host name';
descriptions.connect = 'Time required to create TCP connection';
descriptions.ssl = 'Time required for SSL/TLS negotiation';
descriptions.send = 'Time required to send HTTP request to the server';
descriptions.wait = 'Waiting for a response from the server';
descriptions.receive = 'Time required to read entire response from the server (or cache).';

exports.processPage = function(pageData) {

  if (pageData.har) {
    pageData.har.forEach(function(har) {
      har.log.entries.forEach(function(entry) {
        // TODO verify that timings really exists
        var timings = Object.keys(entry.timings);

        for (var i = 0; i < timings.length; i++) {
          if (timings[i] === 'comment') {
            continue;
          }
          if (timeMetrics.hasOwnProperty(timings[i])) {
            timeMetrics[timings[i]].push(Number(entry.timings[timings[i]]));
          } else {
            timeMetrics[timings[i]] = new Stats();
            timeMetrics[timings[i]].push(Number(entry.timings[timings[i]]));
          }
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
      id: 'har.' + keys[i],
      title: keys[i] + ' time',
      desc: descriptions[keys[i]],
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