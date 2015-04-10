/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var path = require('path'),
	winston = require('winston'),
	fs = require('fs-extra'),
	request = require('request');

exports.task = function(result, config, cb) {

	if (config.postURL) {
		var log = winston.loggers.get('sitespeed.io');

		request({
			url: config.postURL,
			method: 'POST',
			gzip: true,
			json: result
		}, function(error, response, body) {
			if (error) {
				log.error('Couldn\'t send result to ' + config.postURL + ' got error ' + error);
			} else {
				log.info('Succesfully sent result to ' + config.postURL + ' sc:' + response.statusCode + ' response:' + body);
			}
			cb();
		});
	} else {
		cb();
	}
};
