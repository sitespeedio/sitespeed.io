/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var path = require('path'),
  childProcess = require('child_process'),
  phantomPath = require('phantomjs').path,
  slimerPath = require('slimerjs').path,
  util = require('../util/util'),
  inspect = require('util').inspect,
  fs = require('fs'),
  winston = require('winston'),
  Timing = require('../phantomJSTiming'),
  async = require('async');

module.exports = {
  analyze: function(urls, config, callback) {
    var log = winston.loggers.get('sitespeed.io');
    var phantomDir = path.join(config.run.absResultDir, config.dataDir, 'phantomjs');

    fs.mkdir(phantomDir, function(err) {
      if (err) {
        log.error('Couldn\'t create the phantomjs result dir \'%s\': %s', phantomDir, inspect(err));
        return callback(err, {
          'type': 'phantomjs',
          'data': {},
          'errors': {}
        });
      }

      var queue = async.queue(phantomjs, 1);

      var errors = {};
      var pageData = {};
      urls.forEach(function(u) {
        for (var i = 0; i < config.no; i++) {
          queue.push({
            'url': u,
            'config': config,
            'run': i + 1
          }, function(data, err) {
            if (err) {
              errors[u] = err;
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

      queue.drain = function() {
        callback(undefined, {
          'type': 'phantomjs',
          'data': pageData,
          'errors': errors
        });
      };
    });
  }
};

function phantomjs(args, asyncDoneCallback) {
  var url = args.url;
  var config = args.config;
  var run = args.run;
  var log = winston.loggers.get('sitespeed.io');

  var binPath = config.phantomjsPath || phantomPath;
  var childArgs = generatePhantomArgs();

  log.info('Fetching data using PhantomJS for %s', url);

  childProcess.execFile(binPath, childArgs, { timeout: 60000 }, handlePhantomResult);

  function generatePhantomArgs() {
    var childArgs = [];
    if (config.slimerjs) {
      binPath = slimerPath;
    } else {
      childArgs.push('--ssl-protocol=any', '--ignore-ssl-errors=yes');
    }
    childArgs.push(path.join(__dirname, '..', 'phantomjs', 'collectTimings.js'));
    childArgs.push(url);
    childArgs.push(path.join(config.run.absResultDir, config.dataDir, 'phantomjs', util.getFileName(url) +
    '-' + run + '.json'));
    childArgs.push(path.join(config.run.absResultDir, config.dataDir, 'har', 'phantomjs', util.getFileName(url) +
    '-' + run + '.har'));
    childArgs.push(config.viewPort.split('x')[0]);
    childArgs.push(config.viewPort.split('x')[1]);
    childArgs.push(config.userAgent);
    if (config.basicAuth) {
      childArgs.push(config.basicAuth);
    }
    if (config.requestHeaders) {
      childArgs.push(JSON.stringify(config.requestHeaders));
    }
    return childArgs;
  }

  function handlePhantomResult(err, stdout, stderr) {
    if (stderr) {
      log.error('Error getting phantomjs data for \'%s\' (stderr): %s', url, stderr);
    }

    if (err) {
      if (stdout) {
        log.error('Phantomjs output for \'%s\' (stdout): %s', url, stdout);
      }
      return asyncDoneCallback(undefined, err);
    }

    var file = path.join(config.run.absResultDir, config.dataDir, 'phantomjs', util.getFileName(url) +
    '-' + run + '.json');

    fs.readFile(file, function(err, data) {
      if (err) {
        log.error('The phantomjs file was not created: %s', file);
        return asyncDoneCallback(undefined, err);
      }

      var phantomData = null;
      try {
        phantomData = JSON.parse(data);
      } catch (e) {
        err = e;
      }

      asyncDoneCallback(phantomData, err);
    });
  }
}
