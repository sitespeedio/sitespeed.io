/**
* Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
* Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
* and other contributors
* Released under the Apache 2.0 License
*/
var WPTAggregator = require('../WPTAggregator');

module.exports = new WPTAggregator('imageSavingsWPT',
'Image Savings',
'How much that can be saved if the images are compressed (fetched using WebPageTest)',
'pagemetric', 'bytes', 0,
'image_savings'
);
