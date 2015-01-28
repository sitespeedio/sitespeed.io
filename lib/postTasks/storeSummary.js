/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var path = require('path'),
  winston = require('winston'),
  fs = require('fs-extra');

exports.task = function(result, config, cb) {
  var log = winston.loggers.get('sitespeed.io');
  var summary = path.join(config.run.absResultDir, config.dataDir, 'summary.json');
  fs.writeFile(summary, JSON.stringify(result.aggregates), function(err) {
    if (err) {
      log.log('error', 'Couldn\'t write summary json file to disk:' + summary + ' ' + err);
    }
    cb(err);
  });
};
