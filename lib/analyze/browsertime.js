/**
 * Sitespeed.io - How speedy is your site? (https://www.sitespeed.io)
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

var proxy;

module.exports = {
  setupProxy: function(config) {
    var btConfig = {
      // TODO this will not work if we feed with different domain
      url: config.url || config.urls[0],
      basicAuth: config.basicAuth,
      headers: config.requestHeaders,
      userAgent: config.userAgent,
      connection: config.connection,
      silent: (config.tap || config.junit),
      verbose: config.verbose,
      noColor: config.noColor,
      logDir: config.run.absResultDir,
      seleniumServer: config.seleniumServer
    };

    if (config.btConfig) {
      Object.keys(config.btConfig).forEach(function(key) {
        btConfig[key] = config.btConfig[key];
      });
    }

    logger.addLog(null, btConfig);

    proxy = btProxy.createProxy(btConfig);
  },
  analyze: function(urls, config, asyncDoneCallback) {

    var browserList = config.browsertime;
    var log = winston.loggers.get('sitespeed.io');

    var pre = [];

    browserList.forEach(function(browser) {
      pre.push(
        function(callback) {
          fs.mkdirs(path.join(config.run.absResultDir, config.dataDir, 'browsertime', browser), callback);
        }
      );
      pre.push(
        function(callback) {
          fs.mkdirs(path.join(config.run.absResultDir, config.dataDir, 'har', browser), callback);
        }
      );
    });

    pre.push(
      function(callback) {
        proxy.launchProcess(callback);
      }
    );

    // setup the proxy
    this.setupProxy(config);

    async.parallel(pre,
      function(err) {
        if (err) {
          return asyncDoneCallback(err);
        }

        var queue = async.queue(runBrowsertime, 1);
        var errors = {};
        var pageData = {};

        urls.forEach(function(u) {
          browserList.forEach(function(browser) {
            log.info('Queueing browsertime for %s %s', u, browser);
            queue.push({
              'url': u,
              'browser': browser,
              'config': config
            }, function(error, data) {
              if (error) {
                log.error('Error running browsertime: %s', inspect(error));
                errors[u] = error;
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
          proxy.stopProcess(function() {});
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
    verbose: config.verbose,
    noColor: config.noColor,
    logDir: config.run.absResultDir,
    waitScript: config.waitScript,
    onInitialize: config.onInitialize,
    customScripts: config.customScripts,
    seleniumServer: config.seleniumServer
  };

  if (config.btConfig) {
    Object.keys(config.btConfig).forEach(function(key) {
      btConfig[key] = config.btConfig[key];
    });
  }

  log.log('info', 'Running browsertime for ' + browser + ' ' + url);

  browsers.setProxy(proxy);

  var bt = new Browsertime(browsers);

  browserListenerProxy.setup(bt, proxy, btConfig);

  var outputParserTasks = {
    'browser': function(cb) {
      cb(null, browser);
    },
    'browsertime': function(cb) {
      readAsJson(measurementFile, cb);
    }
  };

  if (!btConfig.noProxy) {
    outputParserTasks.har = function(cb) {
      readAsJson(harFile, cb);
    }
  }

  async.waterfall([
    function(done) {
      bt.fetch(btConfig, done);
    },
    function(done) {
      async.parallel(outputParserTasks, done)
    }
  ], callback);
}

function readAsJson(path, callback) {
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) {
      return callback(err);
    }
    try {
      var json = JSON.parse(data);
      return callback(null, json);
    } catch (e) {
      return callback(e);
    }
  })
}