/**
* Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
* Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
* and other contributors
* Released under the Apache 2.0 License
*/
'use strict';
var WPTAggregator = require('../wptAggregator');

module.exports = new WPTAggregator('ImageSavingsWPT',
'Image Savings',
'How much that can be saved if the images are compressed (fetched using WebPageTest)',
'pagemetric', 'bytes', 0,
'image_savings'
);
