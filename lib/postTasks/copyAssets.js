/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var fs = require('fs-extra'),
  path = require('path');

exports.task = function(result, config, cb) {
  if (config.html) {
    fs.copy(path.join(__dirname, '../../assets/'), config.run.absResultDir, cb);
  }
  else {
    cb();
  }
};
