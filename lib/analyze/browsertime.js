/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var util = require('../util/util'),
  fs = require('fs-extra'),
  path = require('path'),
  winston = require('winston'),
  Browsertime = require('browsertime'),
  btProxy = require('browsertime/lib/proxy'),
  browserListenerProxy = require('browsertime/lib/proxy/browserListenerProxy'),
  browsers = require('browsertime/lib/browsers'),
  logger = require('browsertime/lib/logger'),
  inspect = require('util').inspect,
  async = require('async');

  var p;

module.exports = {
  setup: function(config) {
      var btConfig = {
      // TODO this will not work if we feed with different domain
      url: config.url || config.urls[0],
      basicAuth: config.basicAuth,
      headers: config.requestHeaders,
      userAgent: config.userAgent,
      connection: config.connection,
      silent: (config.tap || config.junit),
      noColor: config.noColor,
      logDir: config.run.absResultDir,
      useProxy: true
    };

    if (config.btConfig) {
      Object.keys(config.btConfig).forEach(function(key) {
        btConfig[key] = config.btConfig[key];
      });
    }

    logger.addLog(null, btConfig);

    p = btProxy.createProxy(btConfig);
  },
  preAnalysis: function(cb) {
    p.launchProcess(cb);
  },
  postAnalysis: function(cb) {
    p.stopProcess(cb);
  },
  analyze: function(urls, config, asyncDoneCallback) {

    var browsers = config.browsertime;
    var log = winston.loggers.get('sitespeed.io');

    var mkdirFunctions = [];
    browsers.forEach(function(browser) {
      mkdirFunctions.push(
        function(callback) {
          fs.mkdirs(path.join(config.run.absResultDir, config.dataDir, 'browsertime', browser), callback);
        }
      );
      mkdirFunctions.push(
        function(callback) {
          fs.mkdirs(path.join(config.run.absResultDir, config.dataDir, 'har', browser), callback);
        }
      );
    });

    async.parallel(mkdirFunctions,
      function(err, results) {
        var queue = async.queue(runBrowsertime, 1);
        var errors = {};
        var pageData = {};

        urls.forEach(function(u) {
          browsers.forEach(function(browser) {
            log.info('Queueing browsertime for %s %s', u, browser);
            queue.push({
              'url': u,
              'browser': browser,
              'config': config
            }, function(err, data) {
              if (err) {
                log.error('Error running browsertime: %s', inspect(err));
                errors[u] = err;
              } else {
                if (pageData[u]) {
                  pageData[u].push(data);
                } else {
                  pageData[u] = [data];
                }
              }
            });
          });
        });

        queue.drain = function() {
          asyncDoneCallback(undefined, {
            'type': 'browsertime',
            'data': pageData,
            'errors': errors
          });
        };
      });
  }
};

function runBrowsertime(args, callback) {
  var url = args.url;
  var browser = args.browser;
  var config = args.config;
  var log = winston.loggers.get('sitespeed.io');

  var measurementFile = path.join(config.run.absResultDir, config.dataDir, 'browsertime', browser,
    util.getFileName(url) + '-browsertime.json');

  var harFile = path.join(config.run.absResultDir, config.dataDir, 'har', browser,
    util.getFileName(url) + '.har');

  // TODO add useProxy,scriptPath
  var btConfig = {
    url: args.url,
    browser: browser,
    runs: config.no,
    basicAuth: config.basicAuth,
    headers: config.requestHeaders,
    size: config.viewPort,
    userAgent: config.userAgent,
    harFile: harFile,
    filename: measurementFile,
    connection: config.connection,
    silent: (config.tap || config.junit),
    noColor: config.noColor,
    logDir: config.run.absResultDir,
    useProxy: true
  };

  if (config.btConfig) {
    Object.keys(config.btConfig).forEach(function(key) {
      btConfig[key] = config.btConfig[key];
    });
  }

  log.log('info', 'Running browsertime for ' + browser + ' ' + url);

  browsers.setProxy(p);

  var bt = new Browsertime(browsers);

  browserListenerProxy.setup(bt, p, btConfig);

  bt.fetch(btConfig, function(err) {
    if (err) {
      return callback(err);
    }
    fs.readFile(measurementFile, function(err2, btData) {
      if (err2) {
        log.log('error', 'Couldn\'t read the file:' + measurementFile);
        return callback(err2);
      }

      // TODO we should only read the HAR if we ask for one
      fs.readFile(harFile, function(err3, harData) {
        if (err3) {
          log.log('error', 'Couldn\'t read the file:' + harFile);
          return callback(err3);
        }

        var harJson;
        var btJson;

        try {
          btJson = JSON.parse(btData);
          harJson = JSON.parse(harData);
        } catch (e) {
          return callback(e);
        }

        return callback(undefined, {
          'browser': browser,
          'browsertime': btJson,
          'har': harJson
        });
      });
    });
  });
}
