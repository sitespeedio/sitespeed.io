/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var path = require('path'),
  childProcess = require('child_process'),
  binPath = require('phantomjs').path,
  util = require('../util/util'),
  fs = require('fs'),
  log = require('winston'),
  Timing = require('../phantomJSTiming'),
  async = require('async');

module.exports = {
  analyze: function(urls, config, callback) {

    var phantomDir = path.join(config.run.absResultDir, config.dataDir, 'phantomjs');

    fs.mkdir(phantomDir, function(err) {
      if (err) {
        log.log('error', 'Couldnt create the phantomjs result dir:' + phantomDir + ' ' + err);

        callback(err, {
          'type': 'phantomjs',
          'data': {},
          'errors': {}
        });

      } else {
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
      }

    });


  }
};

function phantomjs(args, asyncDoneCallback) {
  var url = args.url;
  var config = args.config;
  var run = args.run;

  // PhantomJS arguments
  var childArgs = ['--ssl-protocol=any', '--ignore-ssl-errors=yes'];

  //
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
  } else {
    childArgs.push('');
  }

  log.log('info', 'Fetching data using PhantomJS for ' + url);

  childProcess.execFile(binPath, childArgs, {
    timeout: 60000
  }, function(err, stdout, stderr) {

    if (stderr) {
      log.log('error', 'stderr: Error getting phantomjs data ' + url + ' (' + stderr +
        ')');
    }

    if (err) {
      log.log('error', 'Error getting phantomjs: ' + url + ' (' + stdout + stderr +
        err + ')');
      asyncDoneCallback(undefined, err + stdout);
    } else {

      fs.readFile(path.join(config.run.absResultDir, config.dataDir, 'phantomjs', util.getFileName(url) +
        '-' + run + '.json'), function(err, data) {
        if (err) {
          log.log('error', 'Couldnt read the phantomjs file:');
          asyncDoneCallback(undefined, err);
        } else {
          var phantomData;

          try {
            phantomData = JSON.parse(data);
          } catch (e) {
            err = e;
          }

          asyncDoneCallback(phantomData, err);
        }
      });
    }
  });
}