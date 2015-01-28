/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Stats = require('fast-stats').Stats,
    util = require('../util/util');

/**
 * Create a aggregator that collects and aggregates statistics from web pages.
 * Each object needs to implement a processPage function that collects the data
 * for this aggregate.
 *
 * @param id - the ID of the aggregator, used for matching in rules & junit.
 * @param title - the title.
 * @param description -  a nice description on why and how for the aggregator.
 * @param type - what kind of aggregation is this? [timing,rule, pagemetric]
 * @param unit - the unit for the aggregator use one of [seconds|milliseconds|bytes|'']
 * @param decimals - how many decimals used when displaying the value
 * @param processPage - the function aggregating the data.
 */
function Aggregator(id, title, description, type, unit, decimals, processPage) {
  this.id = id;
  this.title = title;
  this.description = description;
  this.type = type;
  this.decimals = decimals;
  this.unit = unit;
  this.processPage = processPage;
  this.key = id;
  this.stats = new Stats();
}

Aggregator.prototype.generateResults = function() {
  return {
    id: this.id,
    title: this.title,
    desc: this.description,
    type: this.type,
    stats: util.getStatisticsObject(this.stats, this.decimals),
    unit: this.unit,
    key: this.key
  };
};

/*
// Each aggretor needs to implement a processPage function
// that is called for every page & the data is picked up
// In this class, we just feed in the constructor
Aggregator.prototype.processPage = function(pageData) {
}
*/

Aggregator.prototype.clear = function() {
  this.stats.reset();
};

module.exports = Aggregator;
