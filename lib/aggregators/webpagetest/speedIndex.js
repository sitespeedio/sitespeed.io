/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var WPTAggregator = require('../wptAggregator');

module.exports = new WPTAggregator('SpeedIndexWPT',
  'Speed Index',
  'The Speed Index is the average time at which visible parts of the page are displayed.  It is expressed in milliseconds and dependent on size of the view port. (fetched using WebPageTest)',
  'timing', '', 0, 'SpeedIndex');
