/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var JUnitTestSuites = require('./jUnitTestSuites'),
	tap = require('./tap'),
	async = require('async'),
	winston = require('winston'),
	path = require('path'),
	yslowUtil = require('../util/yslowUtil');

function TestRenderer(config) {
	this.log = winston.loggers.get('sitespeed.io');
	this.result = {};
	this.config = config;
	this.results = [];
	if (config.junit || config.tap || config.budget) {
		if (config.budget) {
			this.log.log('info', 'Using configured web perf budget ' + JSON.stringify(config.budget));
			this.budget = config.budget;
		} else {
			this.budget = require('../../conf/budget.json');
			this.log.log('info', 'Using default web perf budget:' + JSON.stringify(this.budget));
		}
	}
	this.suites = new JUnitTestSuites(path.join(this.config.run.absResultDir, 'sitespeed.io.junit.xml'), this.config);

}
TestRenderer.prototype.forEachPage = function(url, pageData) {
	var self = this;

	var result = [this._yslow(url, pageData), this._wpt(url, pageData),
		this._headlessTimings(url, pageData),
		this._gpsi(url, pageData),
		this._browserTimings(url, pageData),
		this._page(url, pageData)
	];

	result.forEach(function(r) {
		self._add(r);
	});

};

TestRenderer.prototype._add = function(result) {
	if (result.length > 0) {
		this.suites.addSuite(result[0].type, result);
	}
	this.results.push.apply(this.results, result);

};

TestRenderer.prototype._page = function(url, pageData) {

	var results = [];
	var self = this;

	// only check if we run YSlow

	if ((this.config.testData.indexOf('page') > -1 || this.config.testData.indexOf(
			'all') > -1) && pageData.yslow && this.budget.page) {

		// different types we will check
		var assetTypes = ['js', 'css', 'image', 'cssimage', 'font', 'flash', 'iframe', 'doc'];

		Object.keys(this.budget.page).forEach(function(budget) {

			if (budget === 'requests') {

				var requests = pageData.yslow.comps.length;

				results.push(self._getResult('requests per page',
					url,
          requests < self.budget.page[budget],
					'The number of requests is ' + requests + ' and the limit is ' + self.budget.page[budget],
          requests,
					'page'));

			} else if (budget === 'pageWeight') {
				var pageWeight = yslowUtil.getSize(pageData.yslow.comps);

				results.push(self._getResult('weight per page',
					url,
          pageWeight < self.budget.page[budget],
					'The page weight is ' + pageWeight + ' (bytes) and the limit is ' + self.budget.page[budget],
          pageWeight,
					'page'));

			}

			assetTypes.forEach(function(asset) {

				if (budget === asset) {
					var value = pageData.yslow.comps.filter(function(c) {
						return c.type === asset;
					}).length;

					results.push(self._getResult(asset + ' requests',
						url,
						value < self.budget.page[budget],
						'The number of ' + asset + ' requests + ' + value + ' the limit is ' + self.budget.page[budget],
						value,
						'page'));

				} else if (budget === asset + 'Weight') {

					var assetWeight = yslowUtil.getSize(pageData.yslow.comps.filter(function(c) {
						return c.type === asset;
					}));

					results.push(self._getResult(asset + ' weight',
						url,
            assetWeight < self.budget.page[budget],
						'The ' + asset + ' weight is ' + assetWeight + ' (bytes), the limit is ' + self.budget.page[budget],
            assetWeight,
						'page'));

				}
			});
		});
	}

	return results;

};

TestRenderer.prototype._gpsi = function(url, pageData) {

	var results = [];

	if ((this.config.testData.indexOf('gpsi') > -1 || this.config.testData.indexOf(
			'all') > -1) && pageData.gpsi && this.budget.gpsi) {
		var defaultLimit = this.budget.gpsi.default ? this.budget.gpsi.score : 90;
		var result = {};
		result.title = ' GPSI score';
		result.url = url;
		result.isOK = pageData.gpsi.score > defaultLimit;
		result.description = ' The GPSI score is ' + pageData.gpsi.score +
			' and the limit is ' + defaultLimit;
		result.value = pageData.gpsi.score;
		result.type = 'gpsi';
		results.push(result);
	}
	return results;
};

TestRenderer.prototype._browserTimings = function(url, pageData) {

	var results = [];
	if ((this.config.testData.indexOf('timings') > -1 || this.config.testData.indexOf(
			'all') > -1) && pageData.browsertime && this.budget.timings) {
		var self = this;
		Object.keys(this.budget.timings).forEach(function(timing) {
			pageData.browsertime.browsertime.forEach(function(runPerBrowser) {
				var browser = runPerBrowser.browserName;
				var runs = runPerBrowser.runs;
				var browserVersion = runPerBrowser.browserVersion;
				runPerBrowser.statistics.forEach(function(stats) {
					if (stats.name === timing) {
						var result = {};
						result.title = timing + ' ' + browser;
						result.url = url;
						result.isOk = stats.median < self.budget.timings[timing];
						result.description = 'The time for ' + timing + ' is ' +
							stats.median + 'ms, that is higher that your limit of ' + self.budget.timings[timing] +
							' ms. Using ' + browser + ' version ' + browserVersion +
							' with the median of ' + runs + ' runs.';
						result.value = stats.median;
						result.type = 'timings';
						results.push(result);
					}
				});
			});
		});
	}
	return results;
};

TestRenderer.prototype._headlessTimings = function(url, pageData) {
	var results = [];
  var self = this;

	if ((this.config.testData.indexOf('timings') > -1 || this.config.testData.indexOf(
			'all') > -1) && pageData.headless && this.budget.timings) {
		var self = this;
		Object.keys(this.budget.timings).forEach(function(timing) {

			var stats = pageData.headless.getStats();
			stats.forEach(function(stat) {
				if (stat.id === timing) {
					var result = {};
					result.title = timing + ' using ' + self.config.headless;
					result.url = url;
					result.isOk = stat.stats.median < self.budget.timings[timing];
					result.description = 'the ' + timing + '  is ' +
						stat.stats.median + ' threshold:' + self.budget.timings[timing];


					result.description = 'The time for ' + timing + ' is ' +
						stat.stats.median + 'ms, that is higher that your limit of ' + self.budget.timings[timing] +
						' ms. Using ' + self.config.headless
						' with the median of ' + pageData.headless.runs.length + ' runs.';
					result.value = stats.median;

					result.value = stat.stats.median;
					result.type = 'timings';
					results.push(result);
				}
			});
		});
	}
	return results;
};

TestRenderer.prototype._wpt = function(url, pageData) {

	var results = [];
	if ((this.config.testData.indexOf('wpt') > -1 || this.config.testData.indexOf(
			'all') > -1) && pageData.webpagetest && this.budget.wpt) {
		var self = this;

		pageData.webpagetest.wpt.forEach(function(browserAndLocation) {
			// TODO depending on how many runs we do
			var median = browserAndLocation.response.data.median.firstView;

			Object.keys(self.budget.wpt).forEach(function(key) {
				var result = {};
				result.title = 'WPT ' + key;
				result.url = url;
				result.isOk = median[key] < self.budget.wpt[key];
				result.description = 'The median ' + key + ' is ' + median[key] +
					' and the threshold is set to ' + self.budget.wpt[key];
				result.value = median[key];
				result.type = 'wpt';
				results.push(result);
			});
		});
	}
	return results;
};

TestRenderer.prototype._yslow = function(url, pageData) {

	var results = [];
	if ((this.config.testData.indexOf('rules') > -1 || this.config.testData.indexOf(
			'all') > -1) && pageData.yslow && this.budget.rules) {

		var rules = pageData.yslow.g;
		var ruleDictionary = pageData.yslow.dictionary.rules;
		var rule = Object.keys(rules);
		var self = this;
		var defaultLimit = this.budget.rules.default ? this.budget.rules.default : 90;

		for (var i = 0; i < rule.length; i++) {
			var score = rules[rule[i]].score;
			var result = {};
			// is this skippable?
			if (self.config.skipTest) {
				if (self.config.skipTest.indexOf(rule[i]) > -1) {
					result.title = rule[i] + ' :' + ruleDictionary[rule[i]].name;
					result.url = url;
					result.skipped = true;
					result.description = 'Skipping ' + rule[i] + ' score ' + score;
					result.value = score;
					result.type = 'rule';
					results.push(result);
					continue;
				}
			}
			result.title = rule[i] + ' :' + ruleDictionary[rule[i]].name;
			result.url = url;
			result.isOk = score > defaultLimit;
			result.description = 'The ' + rule[i] + ' has the score ' + score;
			result.value = score;
			result.components = rules[rule[i]].components;
			result.type = 'rule';
			results.push(result);
		}
	}
	return results;
};

TestRenderer.prototype._getResult = function(title, url, isOk, description, value, type) {

	var result = {};
	result.title = title;
	result.url = url;
	result.isOk = isOk;
	result.description = description;
	result.value = value;
	result.type = type;

	return result;
};


TestRenderer.prototype.render = function(cb) {
	var self = this;

	async.parallel({
			writeTap: function(callback) {
				if (self.config.tap) {
					tap.writeTap(self.results, callback);
				} else {
					callback();
				}
			},
			writeJUnit: function(callback) {
				if (self.config.junit) {
					self.suites.render(callback);
				} else {
					callback();
				}
			},
			budget: function(callback) {
				if (self.config.budget) {

					// store the budget result here
					self.config.budgetResult = [];

					self.results.forEach(function(result) {

						self.config.budgetResult.push(result);

						// loop through the result and log
						if (result.isOk) {
							self.log.log('info', 'The budget for ' + result.title + ' ' + result.url + ' ' + ' passed (' + result.value +
								')');
						} else {
							self.log.log('info', 'The budget for ' + result.title + ' ' + result.url + ' ' + ' failed (' + result.value +
								') ' + result.description);
						}
					});
					callback();

				} else {
					callback();
				}
			}
		},
		function(err, results) {
			if (err) {
				self.log.log('error', 'Error rendering budget ' + err);
			}
			cb(err);
		});
};


module.exports = TestRenderer;
