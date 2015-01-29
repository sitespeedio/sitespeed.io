/**
* Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
* Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
* and other contributors
* Released under the Apache 2.0 License
*/
'use strict';
var WPTAggregator = require('../wptAggregator');

module.exports = new WPTAggregator('userTiming',
'userTiming',
'User Timing API metric', 'timing', 'milliseconds', 0,
 // special hack for telling the WPTAggregator to fetch
 // all the user timings
'USERTIMING'
);
