#!/usr/bin/env node

/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
/*eslint no-process-exit:0*/

var Sitespeed = require('../lib/sitespeed'),
	config = require('../lib/cli'),
	winston = require('winston');

var sitespeed = new Sitespeed();

require('whereis')('java', function searched(err) {
	// yep, we still need Java for the crawler & browsertime
	if (err) {
		winston.loggers.get('sitespeed.io').error(
			'Could not find Java, make sure it is installed in your $PATH');
		process.exit(1);
	} else {
		sitespeed.run(config, function(error, data) {
			if (error) {
				winston.loggers.get('sitespeed.io').error(error);
				process.exit(1);
			}

			// do we have a budget?
			if (data && data.budget) {
				var isFailing = false;

        // loop through the result and log
				data.budget.forEach(function(result) {
					if (result.skipped) {
						winston.loggers.get('sitespeed.io').info('Skipping ' + result.title + ' ' + result.url + ' ' + ' value [' +
							result.value + ']');
					} else if (result.isOk) {
						winston.loggers.get('sitespeed.io').info('The budget for ' + result.title + ' ' + result.url + ' passed [' +
							result.value +
							']');
					} else {
						isFailing = true;
						winston.loggers.get('sitespeed.io').error('The budget for ' + result.title + ' ' + result.url + ' failed. ' +
							result.description);
					}
				});

				if (isFailing) {
					process.exit(1);
				}
			}
		});
	}
});
