/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var path = require('path'),
  childProcess = require('child_process'),
  binPath = require('phantomjs').path,
  util = require('../util'),
  fs = require('fs'),
  log = require('winston'),
  async = require('async');



/**
 * Analyze a page using YSlow
 */
module.exports = {
  analyze: function(urls, config, callback) {

    var ySlowResults = path.join(config.run.absResultDir, config.dataDir, 'yslow');
    fs.mkdir(ySlowResults, function(err) {

      if (err) {
        log.log('error', 'Couldnt create YSlow result dir:' + ySlowResults + ' ' + err);
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

  // PhantomJS arguments
  var childArgs = ['--ssl-protocol=any', '--ignore-ssl-errors=yes'];

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
    childArgs.push('--cdns ', config.cdns);
  }

  if (config.requestHeaders) {
    childArgs.push('-ch', JSON.stringify(config.requestHeaders));
  }

  var resultsPath = path.join(config.run.absResultDir, config.dataDir, 'yslow', util.getFileName(url) +
    '-yslow.json');
  childArgs.push('--file', resultsPath);

  childArgs.push(url);

  log.log('info', 'Running YSlow for ' + url);

  childProcess.execFile(binPath, childArgs, {
    timeout: 240000
  }, function(err, stdout, stderr) {

    if (stderr) {
      log.log('error', 'stderr: Error running YSlow: ' + url + ' (' + stderr +
        ')');
    }

    if (err) {
      // YSlow writes console.err but ends up in stdout
      log.log('error', 'Error running YSlow: ' + url + ' (' + JSON.stringify(stdout) + stderr +
        err + ')');
      asyncDoneCallback(undefined, err + stdout);
    } else {
      var file = path.join(config.run.absResultDir, config.dataDir, 'yslow',
        util.getFileName(url) + '-yslow.json');

      fs.readFile(file, function(err, data) {
        if (err) {
          log.log('error', 'Couldnt read the YSlow file:' + file);
          asyncDoneCallback(undefined, err);
        } else {
          var yslow = JSON.parse(data);
          yslow.originalUrl = url;
          /**
                Ok, here's one thing that we have not been able to fix,
                for some reasons sometimes the component array is returned as a String.
                Would be nice to understand why, this is just a quick fix.
          */
          if (!Array.isArray(yslow.comps)) {
            yslow.comps = JSON.parse(yslow.comps);
          }
          asyncDoneCallback(yslow, err);
        }
      });
    }
  });
}
