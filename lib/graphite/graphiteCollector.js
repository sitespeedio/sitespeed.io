/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var util = require('../util/util'),
	winston = require('winston'),
	net = require('net');

function GraphiteCollector(config) {
	this.config = config;
	this.namespace = this.config.graphiteNamespace;
	this.log = winston.loggers.get('sitespeed.io');
	this.timeStamp = ' ' + Math.round(new Date().getTime() / 1000) + '\n';
}

GraphiteCollector.prototype.collect = function(aggregates, pages, domains) {

	var config = this.config;
	var self = this;
	var statistics = '';
	pages.forEach(function(page) {
		statistics += self._getPageStats(page);
	});

	if (this.config.graphiteData.indexOf('summary') > -1 || this.config.graphiteData.indexOf(
			'all') > -1) {
		statistics += this._getSummaryStats(aggregates, config.urlObject.hostname, pages.length);
	}

	statistics += self._getDomainStats(domains, config.urlObject.hostname);

	return statistics;

};

GraphiteCollector.prototype._getPageStats = function(page) {

	var statistics = '';

	var urlKey = util.getGraphiteURLKey(decodeURIComponent(page.url));

	// lets collect the specific data per
	statistics += this._getRuleStats(page, urlKey);
	statistics += this._getBrowserTimeStats(page, urlKey);
	statistics += this._getPageMetricsStats(page, urlKey);
	statistics += this._getGPSIStats(page, urlKey);
	statistics += this._getWPTStats(page, urlKey);
	statistics += this._getAssetsStats(page, urlKey);

	return statistics;

};

GraphiteCollector.prototype._getRuleStats = function(page, urlKey) {

	var statistics = '';
	var self = this;
	if (page.yslow && (this.config.graphiteData.indexOf('rules') > -1 || this.config.graphiteData.indexOf(
			'all') > -1)) {
		Object.keys(page.rules).forEach(function(rule) {
			statistics += self.namespace + '.' + urlKey + '.rules.' + rule + ' ' +
				page.rules[rule].v + self.timeStamp;
		});
	}

	return statistics;
};

GraphiteCollector.prototype._getBrowserTimeStats = function(page, urlKey) {

	var statistics = '';
	var statsWeWillPush = ['min', 'median', 'p90', 'max'];
	var self = this;

	// the timings that are not browser specific
	if (this.config.graphiteData.indexOf('timings') > -1 || this.config.graphiteData.indexOf(
			'all') > -1) {

    // the types we have in our page object
		var types = ['timings', 'custom', 'extras'];

		types.forEach(function(type) {

      // check that we actually collect browser data
			if (page[type]) {
				Object.keys(page[type]).forEach(function(timing) {
					statsWeWillPush.forEach(function(val) {
						// is it a browser?
						if (self.config.supportedBrowsers.indexOf(timing) < 0) {
							statistics += self.namespace + '.' + urlKey + '.' + type + '.' + timing +
								'.' + val + ' ' + page[type][timing][val].v + self.timeStamp;
						}
					});
				});

				// and the browsers
				Object.keys(page[type]).forEach(function(browser) {
					if (self.config.supportedBrowsers.indexOf(browser) > -1) {
						Object.keys(page[type][browser]).forEach(function(timing) {
							statsWeWillPush.forEach(function(val) {
								statistics += self.namespace + '.' + urlKey + '.' + type + '.' +
									browser + '.' + timing + '.' + val + ' ' + page[type][
										browser
									][timing][val].v + self.timeStamp;
							});
						});
					}
				});
			}
		});
	}


	return statistics;
};

GraphiteCollector.prototype._getPageMetricsStats = function(page, urlKey) {

	var statistics = '';
	var self = this;

	if (this.config.graphiteData.indexOf('pagemetrics') > -1 || this.config.graphiteData.indexOf(
			'all') > -1) {
		// and all the assets
		if (page.yslow) {
			Object.keys(page.yslow.assets).forEach(function(asset) {
				statistics += self.namespace + '.' + urlKey + '.assets.' + asset +
					' ' + page.yslow.assets[asset].v + self.timeStamp;
			});

			// and page specific
			statistics += self.namespace + '.' + urlKey + '.score' + ' ' + page.score +
				self.timeStamp;
			statistics += self.namespace + '.' + urlKey + '.noRequests' + ' ' + page.yslow
				.requests.v + self.timeStamp;
			statistics += self.namespace + '.' + urlKey + '.requestsMissingExpire' +
				' ' + page.yslow.requestsMissingExpire.v + self.timeStamp;
			statistics += self.namespace + '.' + urlKey +
				'.timeSinceLastModification' + ' ' + page.yslow.timeSinceLastModification
				.v + self.timeStamp;
			statistics += self.namespace + '.' + urlKey + '.cacheTime' + ' ' + page.yslow
				.cacheTime.v + self.timeStamp;
			statistics += self.namespace + '.' + urlKey + '.pageWeight' + ' ' + page.yslow
				.pageWeight.v + self.timeStamp;
		}
	}

	return statistics;
};

GraphiteCollector.prototype._getGPSIStats = function(page, urlKey) {
	// add gspi score
	if (page.gpsi) {
		return this.namespace + '.' + urlKey + '.gpsi' + ' ' + page.gpsi.gscore.v + this.timeStamp;
	} else {
		return '';
	}
};

GraphiteCollector.prototype._getWPTStats = function(page, urlKey) {

	var statistics = '';
	var self = this;
	// add wpt data
	if (page.wpt) {
		Object.keys(page.wpt).forEach(function(location) {
			Object.keys(page.wpt[location]).forEach(function(browser) {
				Object.keys(page.wpt[location][browser]).forEach(function(connectivity) {
					Object.keys(page.wpt[location][browser][connectivity]).forEach(function(view) {
						Object.keys(page.wpt[location][browser][connectivity][view]).forEach(function(metric) {
							statistics += self.namespace + '.' + urlKey + '.wpt.' + location + '.' +
								connectivity + '.' + browser + '.' + view + '.' + metric + '.median ' +
								page.wpt[location][browser][connectivity][view][metric].v +
								self.timeStamp;
						});
					});
				});
			});
		});
	}

	return statistics;
};


GraphiteCollector.prototype._getAssetsStats = function(page, urlKey) {

	var stats = '';

	if (this.config.graphiteData.indexOf('requests') > -1 || this.config.graphiteData.indexOf(
			'all') > -1) {
		if (page.har) {

			var self = this;
			var timings = ['blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive'];
			page.har.forEach(function(har) {

				har.log.entries.forEach(function(entry) {

					var url = entry.request.url;

					try {
						url = decodeURIComponent(entry.request.url);
					} catch (error) {
						self.log.info('Couldn\'t decode URI:' + entry.request.url);
					}

					var assetURL = util.getGraphiteURLKey(url, '_');

					// remove the last ., we need to rewrite the logic for the
					// keys
					if(assetURL.substr(-1) === '.') {
						assetURL = assetURL.slice(0, -1);
					}

					// TODO when we get the HAR from WPT we should include the browser, location
					// & connectivity in the key

					// get the timestamp from the HAR when the action happend
					var timeStamp = ' ' + Math.round(new Date(entry.startedDateTime).getTime() / 1000) + '\n';
					var total = 0;
					if (entry.timings) {
						timings.forEach(function(timing) {
							total += entry.timings[timing];
							stats += self.namespace + '.' + urlKey + '.requests.' + assetURL + '.timings.' + timing +
								' ' + entry.timings[timing] + timeStamp;
						});
						stats += self.namespace + '.' + urlKey + '.requests.' + assetURL + '.timings.total ' + total + ' ' +
							timeStamp;
					}
					// lets also add the size & type when we are here
					// we use the timestamp for the whole run to make sure
					// we only get one entry, this can and should be cleaned up later
					stats += self.namespace + '.' + urlKey + '.requests.' + assetURL + '.type.' +
					util.getContentType(entry.response.content.mimeType) + '.size ' + entry.response.content.size + ' ' + self.timeStamp;

				});

			});
		}
	}
	return stats;
};

GraphiteCollector.prototype._getDomainStats = function(domains, hostname) {

	var stats = '';
	if (domains) {

		var self = this;
		var timings = ['blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive', 'total'];
		var values = ['min', 'median', 'max'];


		domains.forEach(function(domain) {
			timings.forEach(function(timing) {
				values.forEach(function(value) {
					// TODO we should use the protovol also in the key right
					stats += self.namespace + '.summary.' + hostname + '.domains.timings.' + domain.domain.split('.').join('_') +
						'.' +
						timing + '.' +
						value + ' ' + util.getStatisticsObject(domain[timing].stats, 0)[value] + self.timeStamp;
				});
			});
			// and total time spent downloading
			stats += self.namespace + '.summary.' + hostname + '.domains.accumulatedTime.' + domain.domain.split('.').join('_') + ' ' + domain.accumulatedTime + self.timeStamp;

			// the number of requests
			stats += self.namespace + '.summary.' + hostname + '.domains.requests.' + domain.domain.split('.').join('_') + '' +
				' ' + domain
				.count +
				self.timeStamp;
			// and the size, we only have the size for requests in the first HAR right now
			if (domain.size) {
				Object.keys(domain.size).forEach(function(size) {
					stats += self.namespace + '.summary.' + hostname + '.domains.size.' + domain.domain.split('.').join('_') + '.' + size +
					' ' + domain.size[size] +
					self.timeStamp;
				});
			}
		});
	}

	return stats;
};


GraphiteCollector.prototype._getSummaryStats = function(aggregates, hostname, noOfPages) {
	var statistics = '';
	var self = this;
	var values = ['min', 'p10', 'median', 'mean', 'p90', 'p99', 'max'];

	aggregates.forEach(function(aggregate) {
		values.forEach(function(value) {
			// special handling for WPT values for now
			if (aggregate.id.indexOf('WPT') > -1) {
				statistics += self.namespace + '.summary.' + hostname + '.' + aggregate.type + '.wpt.' +
					aggregate.key + '.' + value + ' ' + aggregate.stats[value] + self.timeStamp;

			} else {
				statistics += self.namespace + '.summary.' + hostname + '.' + aggregate.type + '.' + aggregate.id +
					'.' + value + ' ' + aggregate.stats[value] + self.timeStamp;
			}
		});
	});

	// and add the number of runs
	statistics += self.namespace + '.summary.' + hostname + '.runsPerBrowser ' + this.config.no + this.timeStamp;

	// and number of tested pages per
	statistics += this.namespace + '.summary.' + hostname + '.testedPages ' + noOfPages + this.timeStamp;

	return statistics;
};

module.exports = GraphiteCollector;
