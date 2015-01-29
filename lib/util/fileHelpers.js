/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var fs = require('fs-extra'),
  path = require('path'),
  EOL = require('os').EOL,
  winston = require('winston');

module.exports = {

  save: function(thePath, data, cb) {
    fs.writeFile(thePath, data, cb);
  },

  getFileAsJSON: function(filePath) {
    var fullPathToFile = (filePath.charAt(0) === path.sep) ? filePath : path.join(process.cwd(),
      path.sep, filePath);
    return JSON.parse(fs.readFileSync(fullPathToFile));
  },

  getFileAsArray: function(filePath) {
    var fullPathToFile = (filePath.charAt(0) === path.sep) ? filePath : path.join(process.cwd(),
      path.sep, filePath);

    var data = fs.readFileSync(fullPathToFile);
    var urls = data.toString().split(EOL);
    urls = urls.filter(function(l) {
      return l.length > 0;
    });
    return urls;
  },

  createDir: function(dataDir, cb) {
    // create the home data dir
    fs.mkdirs(dataDir, function(err) {
      if (err) {
        console.error('Couldn\'t create the dir:' + dataDir +
          '. Probably the user starting sitespeed doesn\'t have the privileges to create the directory. ' +
          err);
      }
      cb(err, null);
    });
  },

  writeConfigurationFile: function(config, cb) {
    var log = winston.loggers.get('sitespeed.io');
    // write the configuration file
    var confFile = path.join(config.run.absResultDir, 'config.json');
    fs.writeFile(confFile, JSON.stringify(
      config), function(err) {
      if (err) {
        log.log('error', 'Couldn\'t write configuration file to disk:' + confFile + ' ' + err);
      }
      cb(err, null);
    });
  }

};
