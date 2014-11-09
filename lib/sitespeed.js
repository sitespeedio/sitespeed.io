/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under theApache 2.0 License
 */
var path = require('path'),
  async = require('async'),
  conf = require('./config.js'),
  util = require('./util/util'),
  fileHelper = require('./util/fileHelpers'),
  AnalyzeOneSite = require('./analyzeOneSite'),
  AnalyzeMultipleSites = require('./analyzeMultipleSites'),
  log = require('winston');

function Sitespeed() {}

Sitespeed.prototype.run = function(config, finshedCb) {

  this.config = conf.setupConfiguration(config);
  this._setupLog();

  finshedCb = finshedCb || function() {};

  var self = this;

  async.series([

      function(cb) {
        fileHelper.createDir(path.join(self.config.run.absResultDir, self.config.dataDir), cb);
      },
      function(cb) {
        fileHelper.writeConfigurationFile(self.config, cb);
      },
      function(cb) {
        util.logVersions(cb);
      }
    ],

    function(err, results) {
      if (err) {
        // the error is logged where it happens, so just exit
        process.exit(1);
      }
      if (self.config.sites) {
        var analyzeMultipleSites = new AnalyzeMultipleSites(config);
        analyzeMultipleSites.run(finshedCb);
      } else {
        var analyzeOneSite = new AnalyzeOneSite(config);
        analyzeOneSite.run(finshedCb);
      }
    });
};

Sitespeed.prototype._setupLog = function() {
  log.clear();
  log.add(log.transports.File, {
    filename: path.join(this.config.run.absResultDir, 'info.log'),
    level: 'info',
    json: false
  });

  // we only write to the console, if we don't output
  // tap & junit
  if (!(this.config.tap || this.config.junit)) {
    log.add(log.transports.Console, {
      level: 'info'
    });
  }
};

module.exports = Sitespeed;
