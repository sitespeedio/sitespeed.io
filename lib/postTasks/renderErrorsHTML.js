/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var render = require('../util/htmlRenderer'),
util = require('../util/util');

exports.task = function(result, config, cb) {
	if (config.html) {
		var renderData = {
			'errors': {
				'downloadErrorUrls': result.downloadErrors,
				'analysisErrorUrls': result.analysisErrors
			},
			'totalErrors': Object.keys(result.downloadErrors).length + Object.keys(result.analysisErrors).length,
			'hasErrors': (Object.keys(result.downloadErrors).length + Object.keys(result.analysisErrors).length > 0) ? true : false,
			'config': config,
			'numberOfPages': result.numberOfAnalyzedPages,
			'pageMeta': {
				'title': 'Pages that couldn\'t be analyzed when testing ' + util.getGenericTitle(config),
				'description': 'Here are the pages that couldn\'t be analyzed by sitespeed.io',
				'isErrors': true
			}
		};
		render('errors', renderData, config.run.absResultDir, cb);
	} else {
		cb();
	}
};
