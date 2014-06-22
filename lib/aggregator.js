/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var Stats = require('fast-stats').Stats;
var util = require('./util');

module.exports = Aggregator;

/**
 * Create a aggregator that collects and aggregates statistics from web pages.
 * Each object needs to implement a processPage function that collects the data
 * for this aggregate.
 *
 * @param id - the ID of the aggregator, used for matching in rules & junit.
 * @param title - the title.
 * @param description -  a nice description on why and how for the aggregator.
 * @param unit - the unit for the aggregator use one of [seconds|milliseconds|bytes|'']
 * @param decimals - how many decimals used when displaying the value-
 * @param processPage - the function aggregating the data.
 */
function Aggregator(id, title, description, unit, decimals, processPage) {
  this.id = id;
  this.title = title;
  this.description = description;
  this.decimals = decimals;
  this.unit = unit;
  this.processPage = processPage;
  this.stats = new Stats();
}

Aggregator.prototype.generateResults = function() {
  return {
    id: this.id,
    title: this.title,
    desc: this.description,
    stats: util.getStatisticsObject(this.stats, this.decimals),
    unit: this.unit
  };
};
