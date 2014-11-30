/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var path = require('path'),
  log = require('winston'),
  fs = require('fs-extra');

exports.task = function(result, config, cb) {
  if (config.storeJson) {
    var resultFile = path.join(config.run.absResultDir, config.dataDir, 'result.json');
    fs.writeFile(resultFile, JSON.stringify(result), function(err) {
      if (err) {
        log.log('error', 'Couldnt write result json file to disk:' + resultFile + ' ' + err);
      }
      cb(err);
    });
  } else {
    cb();
  }
};