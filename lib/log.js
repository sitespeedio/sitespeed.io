/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var winston = require('winston'),
    path = require('path'),
    config = require('./conf');

winston.add(winston.transports.File, {
    filename: path.join(config.run.absResultDir, 'info.log'),
    level: 'info'
});
// winston.remove(winston.transports.Console);
