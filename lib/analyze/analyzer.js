/**
 * Sitespeed.io - How speedy is your site? (https://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var yslow = require('./yslow'),
	gpsi = require('./gpsi'),
	browsertime = require('./browsertime'),
	webpagetest = require('./webpagetest'),
	screenshots = require('./screenshots'),
	headless = require('./headless'),
	async = require('async'),
	inspect = require('util').inspect;

function Analyzer() {}

Analyzer.prototype.analyze = function(urls, collector, config, downloadErrors, analysisErrors, urlAnalysedCallback,
	completionCallback) {

	/**
	To keep it simple, we run each task in series so
	that they will not interfere with each other
	*/
	var analyzers = [];

	if (config.runYslow) {
		analyzers.push(yslow);
	}
	if (config.headlessTimings) {
		analyzers.push(headless);
	}
	if (config.gpsiKey) {
		analyzers.push(gpsi);
	}
	if (config.browsertime) {
		analyzers.push(browsertime);
	}
	if (config.wptHost) {
		analyzers.push(webpagetest);
	}
	if (config.screenshot) {
		analyzers.push(screenshots);
	}

	/*
  var preTasks = analyzers.map(function (a) {
    return a.preAnalysis;
  }).filter(function (f) {
        return f instanceof Function;
      });

  var postTasks = analyzers.map(function (a) {
    return a.postAnalysis;
  }).filter(function (f) {
    return f instanceof Function;
  });
*/
	async.series([
			function(callback) {
				async.mapSeries(analyzers,
					function(a, cb) {
						a.analyze(urls, config, cb);
					},
					function(error, results) {
						processAnalysisResults(error, analysisErrors, results, collector, urlAnalysedCallback);
						callback(null);
					});
			}
		],
		function(err) {
			completionCallback(err, downloadErrors, analysisErrors);
		});
};

var extractDataForType = function(type, data) {
	var result;
	switch (type) {
		case 'browsertime':
			{
				result = {
					browsertime: data.map(function(run) {
						return run.browsertime;
					}),
					har: data.map(function(run) {
						return run.har;
					}).filter(function(h) {
						return !!h;
					})
				};
				if (result.har.length == 0) {
					delete result.har;
				}
			}
			break;
		case 'webpagetest':
			{
				result = {
					wpt: data.map(function(run) {
						return run.wpt;
					}),
					har: data.map(function(run) {
						return run.har;
					})
				};
			}
			break;
		default:
			result = data;
			break;
	}
	return result;
};

// There is an old PhantomJS bug where we can not get the right gzipped size of an asset
// https://github.com/ariya/phantomjs/issues/10156
function fixWrongByteSizeInYSlow(pageData) {
	if (pageData.yslow) {
		var harData = [];
		if (pageData.browsertime && pageData.browsertime.har) {
			Array.prototype.push.apply(harData, pageData.browsertime.har);
		}

		else if (pageData.webpagetest && pageData.webpagetest.har) {
	  Array.prototype.push.apply(harData, pageData.webpagetest.har);
	}

// Workaround to avoid issues when bt doesn't generate a har due to useProxy being set to false
		harData = harData.filter(function(har) {
			return !!har;
		});

	// maybe we don't need to go through all the HAR:s
	harData.forEach(function(har) {
	  har.log.entries.forEach(function(entry) {
	    var url = entry.request.url;
	    var size = entry.response.bodySize;
			// if we use SPDY the size is 0 from WPT
	    if (size > 0) {
	      pageData.yslow.comps.forEach(function(component) {
	        if (url === decodeURIComponent(component.url)) {
	          component.size = size;
	          component.gzip = size;
	        }
	      });
	    }
	  });
	});
	}
}

function processAnalysisResults(error, analysisErrors, analysisResults, collector, perUrlCallback) {
	if (error) {
		return;
	}

	var dataPerUrl = {};

	analysisResults.forEach(function(result) {
		var errors = result.errors;
		for (var errorUrl in errors) {
			if (errors.hasOwnProperty(errorUrl)) {
				var e = analysisErrors[errorUrl] || {};
				e[result.type] = inspect(errors[errorUrl]);
				analysisErrors[errorUrl] = e;
			}
		}

		var data = result.data;
		for (url in data) {
			if (data.hasOwnProperty(url)) {
				var pageData = dataPerUrl[url] || {};
				pageData[result.type] = extractDataForType(result.type, data[url]);
				fixWrongByteSizeInYSlow(pageData);
				dataPerUrl[url] = pageData;
			}
		}
	});

	for (var url in dataPerUrl) {
		if (dataPerUrl.hasOwnProperty(url)) {
			var d = dataPerUrl[url];
			collector.collectPageData(d);
			perUrlCallback(null, url, d);
		}
	}
}

module.exports = Analyzer;
