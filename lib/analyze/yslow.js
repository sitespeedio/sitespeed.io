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
        log.log('error', 'Couldn\'t create YSlow result dir:' + ySlowResults + ' ' + err);
        callback(err, {
          'type': 'yslow',
          'data': {},
          'errors': {}
        });
      } else {

        var queue = async.queue(analyzeUrl, config.threads);

        var errors = {};
        var pageData = {};
        urls.forEach(function(u) {
          queue.push({
            'url': u,
            'config': config
          }, function(data, err) {
            if (err) {
              errors[u] = err;
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
      }
    });
  }
};

function analyzeUrl(args, asyncDoneCallback) {
  var url = args.url;
  var config = args.config;
  var log = winston.loggers.get('sitespeed.io');

  var binPath = phantomPath;

  // PhantomJS arguments
  var childArgs = [];

  if (args.slimerjs) {
    binPath = slimerPath;
  } else {
    childArgs.push('--ssl-protocol=any', '--ignore-ssl-errors=yes');
  }

  if (config.proxy) {
    childArgs.push('--proxy', config.urlProxyObject.host, '--proxy-type',
      config.urlProxyObject.protocol);
  }

  // arguments to YSlow
  childArgs.push(path.join(__dirname, '..', config.yslow), '-d', '-r', config.ruleSet,
    '--ua', config.userAgent);

  childArgs.push('-c', '1');

  if (config.basicAuth) {
    childArgs.push('-ba', config.basicAuth);
  }

  if (config.cdns) {
    childArgs.push('--cdns', config.cdns.join(','));
  }

  if (config.requestHeaders) {
    childArgs.push('-ch', JSON.stringify(config.requestHeaders));
  }

  var resultsPath = path.join(config.run.absResultDir, config.dataDir, 'yslow', util.getFileName(url) +
    '-yslow.json');
  childArgs.push('--file', resultsPath);

  childArgs.push('-vp', config.viewPort);

  childArgs.push(url);

  log.log('info', 'Running YSlow for ' + url);

  childProcess.execFile(binPath, childArgs, {
    timeout: 240000
  }, function(err, stdout, stderr) {
    log.verbose('Done processing url in yslow: %s', url);

    if (stderr) {
      log.log('error', 'stderr: Error running YSlow: ' + url);
    }

    if (err) {
      log.log('error', 'Couldn\'t run YSlow for ' + url + ' : ' + JSON.stringify(err));
      asyncDoneCallback(undefined, err);
    }
    else {
      var file = path.join(config.run.absResultDir, config.dataDir, 'yslow',
        util.getFileName(url) + '-yslow.json');

      fs.readFile(file, function(error, data) {
        if (error) {
          log.log('error', 'The YSlow file was not created:' + file);
          asyncDoneCallback(undefined, error);
        } else {
          var yslow;
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
          asyncDoneCallback(yslow, err);
        }
      });
    }
  });
}
