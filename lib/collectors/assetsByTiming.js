/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var util = require('../util/util'),
	RequestTiming = require('../requestTiming'),
	winston = require('winston');
var assets = {};

exports.processPage = function(pageData) {
	var log = winston.loggers.get('sitespeed.io');

	var harData = [];
	if (pageData.browsertime) {
		Array.prototype.push.apply(harData, pageData.browsertime.har);
	}
	if (pageData.webpagetest) {
		Array.prototype.push.apply(harData, pageData.webpagetest.har);
	}

	var pageURL = util.getURLFromPageData(pageData);
	harData.forEach(function(har) {
		// could happen that we didn't have the har data
		if (har.log) {
			har.log.entries.forEach(function(entry) {
				var asset = assets[entry.request.url];
				var total;
				if (asset) {
					if (entry.timings) {
						total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl +
							entry.timings
							.send + entry.timings.wait + entry.timings.receive;
						asset.timing.add(total, entry.request.url, pageURL);
					} else {
						log.log('info', 'Missing timings in the HAR');
					}
				} else {
					if (entry.timings) {
						total = entry.timings.blocked + entry.timings.dns + entry.timings.connect + entry.timings.ssl +
							entry.timings
							.send + entry.timings.wait + entry.timings.receive;
						assets[entry.request.url] = {
							url: entry.request.url,
							timing: new RequestTiming(total, entry.request.url, pageURL),
							parent: util.getURLFromPageData(pageData)
						};
					}
				}
			});
		}
	});
};

exports.generateResults = function() {
	var values = Object.keys(assets).map(function(key) {
		return assets[key];
	});

	return {
		id: 'assetsByTiming',
		list: values
	};
};

exports.clear = function() {
	assets = {};
};
