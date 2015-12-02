/**
 * Sitespeed.io - How speedy is your site? (https://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var path = require('path'),
  childProcess = require('child_process'),
  phantomPath = require('phantomjs').path,
  slimerPath = require('slimerjs').path,
  util = require('../util/util'),
  inspect = require('util').inspect,
  fs = require('fs'),
  winston = require('winston'),
  async = require('async');

module.exports = {
  analyze: function(urls, config, callback) {
    var log = winston.loggers.get('sitespeed.io');
    var screenshotsDir = path.join(config.run.absResultDir, config.dataDir, 'screenshots');

    fs.mkdir(screenshotsDir, function(err) {
      if (err) {
        log.error('Couldn\'t create the screenshot result dir \'%s\': %s', screenshotsDir, inspect(err));
        return callback(err, {
          'type': 'screenshots',
          'data': {},
          'errors': {}
        });
      }

      var queue = async.queue(screenshot, config.threads);

      var errors = {};
      urls.forEach(function(u) {
        queue.push({
          'url': u,
          'config': config
        }, function(error) {
          if (error) {
            log.error('Error taking screenshots for url \'%s\': %s', u, inspect(error));
            errors[u] = error;
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
    });
  }
};

function screenshot(args, asyncDoneCallback) {
  var url = args.url;
  var config = args.config;
  var log = winston.loggers.get('sitespeed.io');

  var binPath = config.phantomjsPath || phantomPath;
  var phantomArgs = generatePhantomArgs();

  log.info('Taking screenshot for %s', url);

  childProcess.execFile(binPath, phantomArgs, { timeout: 240000 }, handlePhantomResult);

  function generatePhantomArgs() {
    var childArgs = [];
    if (config.headless === 'slimerjs') {
      binPath = slimerPath;
    } else {
      childArgs.push('--ssl-protocol=any', '--ignore-ssl-errors=yes');
    }

    // Script to run on the  headless browser
    childArgs.push(path.join(__dirname, '..', 'headless', 'scripts', 'screenshot.js'));

    // Arguments to that script
    childArgs.push(url);
    childArgs.push(path.join(config.run.absResultDir, config.dataDir, 'screenshots', util.getFileName(url) +
    '.png'));
    childArgs.push(config.viewPort.split('x')[0]);
    childArgs.push(config.viewPort.split('x')[1]);
    childArgs.push(config.userAgent);
    childArgs.push('true');
    if (config.requestHeaders) {
      childArgs.push(JSON.stringify(config.requestHeaders));
    } else {
      childArgs.push('false');
    }
    if (config.basicAuth) {
      childArgs.push(config.basicAuth);
    } else {
      childArgs.push('false');
    }
    childArgs.push(config.waitScript);
    return childArgs;
  }

  function handlePhantomResult(err, stdout, stderr) {
    if (stderr) {
      log.error('Error getting screenshots for \'%s\' (stderr): %s', url, stderr);
    }

    if (err && stdout) {
      log.error('Phantomjs output for \'%s\' (stdout): %s', url, stdout);
    }

    return asyncDoneCallback(err);
  }
}
