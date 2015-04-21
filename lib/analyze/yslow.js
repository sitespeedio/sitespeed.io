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
  async = require('async');

/**
 * Analyze a page using YSlow
 */
module.exports = {
  analyze: function(urls, config, callback) {
    var log = winston.loggers.get('sitespeed.io');
    var ySlowResults = path.join(config.run.absResultDir, config.dataDir, 'yslow');

    fs.mkdir(ySlowResults, function(err) {
      if (err) {
        log.error('Couldn\'t create YSlow result dir \'%s\': %s', ySlowResults, inspect(err));
        return callback(err, {
          'type': 'yslow',
          'data': {},
          'errors': {}
        });
      }

      var queue = async.queue(analyzeUrl, config.threads);

      var errors = {};
      var pageData = {};
      urls.forEach(function(u) {
        queue.push({
          'url': u,
          'config': config
        }, function(error, data) {
          if (error) {
            log.error('Error running yslow for url \'%s\': %s', u, inspect(error));
            errors[u] = error;
          } else {
            pageData[u] = data;
          }
        });
      });

      queue.drain = function() {
        callback(undefined, {
          'type': 'yslow',
          'data': pageData,
          'errors': errors
        });
      };
    });
  }
};

function analyzeUrl(args, asyncDoneCallback) {
  var url = args.url;
  var config = args.config;
  var log = winston.loggers.get('sitespeed.io');

  var binPath = config.phantomjsPath || phantomPath;
  var childArgs = generatePhantomArgs();

  log.info('Running YSlow for %s [' + config.headless + ']', url);

  childProcess.execFile(binPath, childArgs, {timeout: 240000}, handlePhantomResult);

  function generatePhantomArgs() {
    var a = [];
    if (config.headless === 'slimerjs') {
      binPath = slimerPath;
    } else {
      a.push('--ssl-protocol=any', '--ignore-ssl-errors=yes');
    }
    if (config.proxy) {
      a.push('--proxy', config.urlProxyObject.host, '--proxy-type',
          config.urlProxyObject.protocol);
    }
    // arguments to YSlow
    var scriptPath;
    if (config.yslow) {
      scriptPath = path.resolve(config.yslow);
    } else {
      scriptPath = path.join(__dirname, '..', 'headless', 'scripts', 'yslow-3.1.8-sitespeed.js');
    }
    a.push(scriptPath, '-d', '-r', config.ruleSet,
        '--ua', config.userAgent);
    // childArgs.push('-c', '1');
    if (config.basicAuth) {
      a.push('-ba', config.basicAuth);
    }
    if (config.cdns) {
      a.push('--cdns', config.cdns.join(','));
    }
    if (config.requestHeaders) {
      a.push('-ch', JSON.stringify(config.requestHeaders));
    }
    var resultsPath = path.join(config.run.absResultDir, config.dataDir, 'yslow', util.getFileName(url) +
    '-yslow.json');
    a.push('--file', resultsPath);
    a.push('-vp', config.viewPort);
    a.push('--waitScript', config.waitScript);
    a.push(url);
    return a;
  }

  function handlePhantomResult(err, stdout, stderr) {
    log.verbose('Done processing url in yslow: %s', url);

    if (stderr) {
      log.error('Yslow output for \'%s\' (stderr): %s', url, stderr);
    }

    if (err) {
      if (stdout) {
        log.error('Yslow output for \'%s\' (stdout): %s', url, stdout);
      }
      return asyncDoneCallback(err);
    }

    var file = path.join(config.run.absResultDir, config.dataDir, 'yslow',
        util.getFileName(url) + '-yslow.json');

    fs.readFile(file, function(error, data) {
      if (error) {
        log.error('The YSlow file was not created: %s', file);
        return asyncDoneCallback(error);
      }

      var yslow = null;
      try {
        yslow = JSON.parse(data);
        yslow.originalUrl = url;
        /**
         Ok, here's one thing that we have not been able to fix,
         for some reasons sometimes the component array is returned as a String.
         Would be nice to understand why, this is just a quick fix.
         */
        if (!Array.isArray(yslow.comps)) {
          yslow.comps = JSON.parse(yslow.comps);
        }
      } catch (e) {
        err = e;
      }
      return asyncDoneCallback(err, yslow);
    });
  }
}
