/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var WPTAggregator = require('../WPTAggregator');

module.exports = new WPTAggregator('RequestsWPT',
  'Requests',
  'The number of requests',
  'pagemetric', '', 0,
  'requests');
