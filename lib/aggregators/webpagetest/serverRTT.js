/**
* Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
* Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
* and other contributors
* Released under the Apache 2.0 License
*/
var WPTAggregator = require('../WPTAggregator');

module.exports = new WPTAggregator('serverRTTWPT',
'Round Trip Time',
'Estimated Server Round Trip Time',
'timing', 'milliseconds', 0,
'server_rtt');
