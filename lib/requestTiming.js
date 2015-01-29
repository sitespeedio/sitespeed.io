/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var Stats = require('fast-stats').Stats;

/**
 * Create a a new request timing.
 *
 * @param {Integer} time - the time this part took in ms.
 * @param {Integer} url - the url to the asset that took this time.
 * @param {Integer} pageUrl - the url to page that has this asset.
 */
function RequestTiming(time, url, pageUrl) {
  this.stats = new Stats().push(time);
  this.maxTimeUrl = url;
  this.maxTimePageUrl = pageUrl;
}

RequestTiming.prototype.add = function(time, url, pageUrl) {
  if (time > this.stats.max) {
    this.maxTimeUrl = url;
    this.maxTimePageUrl = pageUrl;
  }
  this.stats.push(time);
};

RequestTiming.prototype.stats = function() {
  return this.stats;
};

module.exports = RequestTiming;
