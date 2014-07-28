/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var path = require('path'),
  childProcess = require('child_process'),
  config = require('./../conf'),
  binPath = require('phantomjs').path,
  util = require('../util'),
  fs = require('fs'),
  log = require('winston'),
  async = require('async');

module.exports = {
  takeScreenshots: function(urls, callback) {

    var screenshotsDir = path.join(config.run.absResultDir, config.dataDir, 'screenshots');

    fs.mkdir(screenshotsDir, function(err) {
      if (err) {
        log.log('error', "Couldn't create the screenshot result dir:" + screenshotsDir + ' ' + err);

        callback(err, {
          'type': 'screenshots',
          'data': {},
          'errors': {}
        });
        
      } else {
        var queue = async.queue(screenshot, config.threads);

        var errors = {};
        var pageData = {};
        urls.forEach(function(u) {
          queue.push({
            "url": u
          }, function(err) {
            if (err) {
              errors[u] = err;
            }
          });
        });

        queue.drain = function() {
          callback(undefined, {
            'type': 'screenshots',
            'data': {},
            'errors': errors
          });
        };
      }

    });


  }
};

function screenshot(args, asyncDoneCallback) {
  var url = args.url;

  // PhantomJS arguments
  var childArgs = ['--ssl-protocol=any', '--ignore-ssl-errors=yes'];

  //
  childArgs.push(path.join(__dirname, '..', 'screenshot.js'));

  childArgs.push(url);
  childArgs.push(path.join(config.run.absResultDir, config.dataDir, 'screenshots', util.getUrlHash(url) +
    '.png'));
  childArgs.push(config.viewPort.split("x")[0]);
  childArgs.push(config.viewPort.split("x")[1]);
  childArgs.push(config.userAgent);
  childArgs.push(true);

  if (config.basicAuth)
    childArgs.push(config.basicAuth);

  log.log('info', "Taking screenshot for " + url);

  childProcess.execFile(binPath, childArgs, {
    timeout: 60000
  }, function(err, stdout, stderr) {

    if (stderr) {
      log.log('error', 'stderr: Error getting screenshots ' + url + ' (' + stderr +
        ')');
    }

    if (err) {
      log.log('error', 'Error getting screenshots: ' + url + ' (' + stdout + stderr +
        err + ')');
      asyncDoneCallback(undefined, err + stdout);
    } else {
      asyncDoneCallback(undefined, err);
    }
  });
}
