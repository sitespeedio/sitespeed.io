/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Stats = require('fast-stats').Stats;

function WPTMetric(metricName, view, location, browser, connectivity) {
  this.view = view;
  this.location = location;
  this.browser = browser;
  this.connectivity = connectivity;
  this.metricName = metricName;

  // decide if it's a summary independent of browsers etcs
  if (location && connectivity && browser) {
    this.key = location + '.' + connectivity + '.' + browser + '.' + view + '.' + metricName;
  } else {
    this.key = view + '.' + metricName;
  }

  this.stats = new Stats();
}

WPTMetric.prototype.push = function(value) {
  this.stats.push(value);
};

module.exports = WPTMetric;
