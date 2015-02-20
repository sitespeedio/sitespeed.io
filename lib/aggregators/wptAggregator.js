/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var util = require('../util/util'),
    WPTMetric = require('./wptMetric');
var views = ['firstView', 'repeatView'];
var USER_TIMING = 'USERTIMING';

/**
 * Create a WebPageTest aggregator that collects and aggregates statistics from web pages.
 *
 * @param id - the ID of the aggregator, used for matching in rules & junit.
 * @param title - the title.
 * @param description -  a nice description on why and how for the aggregator.
 * @param type - what kind of aggregation is this? [timing,rule, pagemetric]
 * @param unit - the unit for the aggregator use one of [seconds|milliseconds|bytes|'']
 * @param decimals - how many decimals used when displaying the value
 * @param metric - the name of the WPT metric.
 */
function WPTAggregator(id, title, description, type, unit, decimals, metric) {
  this.id = id;
  this.title = title;
  this.description = description;
  this.type = type;
  this.decimals = decimals;
  this.unit = unit;
  this.metric = metric;
  this.metrics = {};
}

WPTAggregator.prototype.processPage = function(pageData) {
  if (pageData.webpagetest) {
    var self = this;
    pageData.webpagetest.wpt.forEach(function(browserAndLocation) {

      var runs = Array.isArray(browserAndLocation.response.data.run) ?
        browserAndLocation.response.data.run :
          [browserAndLocation.response.data.run];

      runs.forEach(function(run) {
        views.forEach(function(view) {
          if (typeof run[view] !== 'undefined') {
            self._collectData(run, view, browserAndLocation);
          }
        });
      });
    });
  }
};

WPTAggregator.prototype._collectData = function(run, view, browserAndLocation) {
  var self = this;
  var bAndL = browserAndLocation.response.data.location.split(':');
  var browser = bAndL[1].toLowerCase();
  var location = bAndL[0].toLowerCase();
  var connectivity = (browserAndLocation.response.data.connectivity).toLowerCase();
  var key = view + location + browser + connectivity;

  if (this.metric !== USER_TIMING) {
    // default behaviour, add all the metrics.
    // we store two: one for the specific brower/location/connectivity
    // and one for the specific metric per view
    if (self.metrics[key]) {
      self.metrics[key].push(run[view].results[self.metric]);
      self.metrics[self.id + view].push(run[view].results[self.metric]);
    } else {
      var metric = new WPTMetric(self.metric, view, location, browser, connectivity);
      var summaryMetric = new WPTMetric(self.metric, view);
      metric.push(run[view].results[self.metric]);
      summaryMetric.push(run[view].results[self.metric]);
      self.metrics[key] = metric;
      self.metrics[self.id + view] = summaryMetric;
    }
  } else {
    this._collectUserTimings(run, view, location, browser, connectivity, key);
  }
};

WPTAggregator.prototype._collectUserTimings = function(run, view, location, browser, connectivity, key) {

  var self = this;
  // if we have any user timings
  if (run[view].results.userTimes) {
    Object.keys(run[view].results.userTimes).forEach(function(userTiming) {

      if (self.metrics[key + userTiming]) {
        self.metrics[key + userTiming].push(Number(run[view].results.userTimes[userTiming]));
        self.metrics[userTiming + view].push(Number(run[view].results.userTimes[userTiming]));
      } else {
        var metric = new WPTMetric(userTiming, view, location, browser, connectivity);
        var summaryMetric = new WPTMetric(userTiming, view);
        metric.push(Number(run[view].results.userTimes[userTiming]));
        summaryMetric.push(Number(run[view].results.userTimes[userTiming]));
        self.metrics[key + userTiming] = metric;
        self.metrics[userTiming + view] = summaryMetric;
      }
    });
  }
};


WPTAggregator.prototype.generateResults = function() {
  var keys = Object.keys(this.metrics),
    result = [];

  for (var i = 0; i < keys.length; i++) {
    result.push({
      // if
      id: this.metrics[keys[i]].view + this.id + ((this.metrics[keys[i]].browser) ? this.metrics[keys[i]].browser + this.metrics[keys[i]].location + this
      .metrics[keys[i]].connectivity : ''),
      // if it's user timing, add the name of the metric, else the title
      title: ((this.id === 'userTiming') ? this.metrics[keys[i]].metric : this.title) + ((this.metrics[keys[i]].browser) ? ' ' + this.metrics[keys[i]].browser + ' ' + this.metrics[keys[i]].location + ' ' + this
        .metrics[keys[i]].connectivity : '') + ' (' + this.metrics[keys[i]].view + ')',
      desc: this.description,
      type: this.type,
      stats: util.getStatisticsObject(this.metrics[keys[i]].stats, this.decimals),
      unit: this.unit,
      key: this.metrics[keys[i]].key
    });
  }
  return result;
};

WPTAggregator.prototype.clear = function() {
  this.metrics = {};
};


module.exports = WPTAggregator;
