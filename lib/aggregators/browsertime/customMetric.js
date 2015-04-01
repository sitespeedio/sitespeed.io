/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Stats = require('fast-stats').Stats;
var util = require('../../util/util');
var metrics = {};

exports.id = 'browsertimeCustomMetrics';

exports.processPage = function(pageData) {

	if (pageData.browsertime) {
		pageData.browsertime.browsertime.forEach(function(runPerBrowser) {
			if (runPerBrowser.custom) {
				runPerBrowser.custom.data.forEach(function(metric) {
					Object.keys(metric).forEach(function(key) {
						if (util.isNumber(metric[key])) {
							if (metrics.hasOwnProperty(key)) {
								metrics[key].push(Number(metric[key]));
							} else {
								metrics[key] = new Stats().push(Number(metric[key]));
							}
						}
					});
				});
			}
		});
	}
};

exports.generateResults = function() {
	var keys = Object.keys(metrics),
		result = [];

	for (var i = 0; i < keys.length; i++) {
		result.push({
			id: keys[i],
			title: keys[i],
			desc: '',
			type: 'customMetric',
			stats: util.getStatisticsObject(metrics[keys[i]], 0),
			unit: ''
		});
	}

	return result;
};

exports.clear = function() {
	metrics = {};
};
