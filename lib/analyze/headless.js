/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
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
  Timing = require('../headless/headlessTiming'),
  async = require('async');
var PATH = 'headless';

module.exports = {
  analyze: function(urls, config, callback) {
    var log = winston.loggers.get('sitespeed.io');
    var dir = path.join(config.run.absResultDir, config.dataDir, PATH);

    fs.mkdir(dir, function(err) {
      if (err) {
        log.error('Couldn\'t create the headless result dir \'%s\': %s', dir, inspect(err));
        return callback(err, {
          'type': 'headless',
          'data': {},
          'errors': {}
        });
      }

      var queue = async.queue(runHeadless, 1);

      var errors = {};
      var pageData = {};
      /*eslint-disable no-loop-func*/
      urls.forEach(function(u) {
        for (var i = 0; i < config.no; i++) {
          queue.push({
            'url': u,
            'config': config,
            'run': i + 1
          }, function(error, data) {
            if (error) {
              log.error('Error running headless for url \'%s\': %s', u, inspect(error));
              errors[u] = error;
            } else {
              if (pageData[u]) {
                pageData[u].add(data);
              } else {
                var t = new Timing();
                t.add(data);
                pageData[u] = t;
              }
            }
          });
        }
      });
      /*eslint-enable no-loop-func*/
      queue.drain = function() {
        callback(undefined, {
          'type': 'headless',
          'data': pageData,
          'errors': errors
        });
      };
    });
  }
};

function runHeadless(args, asyncDoneCallback) {
  var url = args.url;
  var config = args.config;
  var run = args.run;
  var log = winston.loggers.get('sitespeed.io');

  var binPath = config.phantomjsPath || phantomPath;
  var childArgs = generateArgs();

  log.info('Fetching timing data using ' + config.headless + ' for %s', url);

  childProcess.execFile(binPath, childArgs, { timeout: 60000 }, handleResult);

  function generateArgs() {
    var a = [];
    if (config.headless === 'slimerjs') {
      binPath = slimerPath;
    } else {
      a.push('--ssl-protocol=any', '--ignore-ssl-errors=yes');
    }
    a.push(path.join(__dirname, '..', 'headless', 'scripts', 'collectTimings.js'));
    a.push(url);
    a.push(path.join(config.run.absResultDir, config.dataDir, PATH, util.getFileName(url) +
    '-' + run + '.json'));
    a.push(path.join(config.run.absResultDir, config.dataDir, 'har', PATH, util.getFileName(url) +
    '-' + run + '.har'));
    a.push(config.viewPort.split('x')[0]);
    a.push(config.viewPort.split('x')[1]);
    a.push(config.userAgent);
    a.push(config.waitScript);
    if (config.basicAuth) {
      a.push(config.basicAuth);
    }
    if (config.requestHeaders) {
      a.push(JSON.stringify(config.requestHeaders));
    }
    return a;
  }

  function handleResult(err, stdout, stderr) {
    if (stderr) {
      log.error('Error getting headless data for \'%s\' (stderr): %s', url, stderr);
    }

    if (err) {
      if (stdout) {
        log.error('Output for \'%s\' (stdout): %s', url, stdout);
      }
      return asyncDoneCallback(err);
    }

    var file = path.join(config.run.absResultDir, config.dataDir, PATH, util.getFileName(url) +
    '-' + run + '.json');

    fs.readFile(file, function(error, data) {
      if (error) {
        log.error('The headless file was not created: %s', file);
        return asyncDoneCallback(error);
      }

      var headlessData = null;
      try {
        headlessData = JSON.parse(data);
      } catch (e) {
        error = e;
      }

      asyncDoneCallback(error, headlessData);
    });
  }
}
