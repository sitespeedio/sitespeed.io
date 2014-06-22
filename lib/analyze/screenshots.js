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

var data_path = path.join(config.run.absResultDir, config.dataDir);

module.exports = {
  analyze: function(urls, callback) {
    fs.mkdirSync(path.join(data_path, 'screenshots'));

    var queue = async.queue(analyzeUrl, config.threads);

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
};

function analyzeUrl(args, asyncDoneCallback) {
  var url = args.url;

  // PhantomJS arguments
  var childArgs = ['--ssl-protocol=any', '--ignore-ssl-errors=yes'];

  //
  childArgs.push(path.join(__dirname, '..', 'screenshot.js'));

  childArgs.push(url);
  childArgs.push(path.join(data_path, 'screenshots', util.getUrlHash(url) +
    '.png'));
  childArgs.push(config.viewPort.split("x")[0]);
  childArgs.push(config.viewPort.split("x")[1]);
  childArgs.push(config.userAgent);
  childArgs.push(true);

  if (config.basicAuth)
    childArgs.push(config.basicAuth);

  log.log('info', "Taking screenshots for " + url);

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
