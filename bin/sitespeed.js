#!/usr/bin/env node

/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

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
    sitespeed.run(config, function(err) {
      if (err) {
        winston.loggers.get('sitespeed.io').error(err);
        process.exit(1);
      }
    });
  }
});
