/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

var util = require('../util/util'),
  fs = require('fs-extra'),
  path = require('path'),
  log = require('winston'),
  Browsertime = require('browsertime'),
  btProxy = require('browsertime/lib/proxy'),
  browserListenerProxy = require('browsertime/lib/proxy/browserListenerProxy'),
  browsers = require('browsertime/lib/browsers'),
  async = require('async');

var p = btProxy.createProxy({url: 'http://www.sitespeed.io'});

module.exports = {
  preAnalysis: function(cb) {
    p.launchProcess(cb);
  },
  postAnalysis: function(cb) {
    p.stopProcess(cb);
  },
  analyze: function(urls, config, asyncDoneCallback) {

    var browsers = config.browsertime;

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
            log.log('info', 'Queueing browsertime for ' + u + ' ' + browser);
            queue.push({
              'url': u,
              'browser': browser,
              'config': config
            }, function(data, code) {
              if (code) {
                log.log('error', 'Error running browsertime: ' + code + JSON.stringify(data));
                errors[u] = code;
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

  var meausurementFile = path.join(config.run.absResultDir, config.dataDir, 'browsertime', browser,
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
    filename: meausurementFile,
    connection: config.connection,
    silent: false,
    useProxy: true
  };

  // tap/junit ouput direct to the console, so let BT be quiet
  if (config.tap || config.junit) {
    btConfig.silent = true;
  }

  if (config.btConfig) {
    Object.keys(config.btConfig).forEach(function(key) {
      btConfig[key] = config.btConfig[key];
    });
  }

  log.log('info', 'Running browsertime for ' + browser + ' ' + url);

  browsers.setProxy(p);

  var bt = new Browsertime(browsers);

  browserListenerProxy.setup(bt, p, btConfig);

  bt.fetch(btConfig, function() {
    fs.readFile(meausurementFile, function(err, btData) {
      if (err) {
        log.log('error', 'Couldnt read the file:' + meausurementFile);
        callback(undefined, err);
      } else {
        // TODO we should only read the HAR if we ask for one
        fs.readFile(harFile, function(err, harData) {
          if (err) {
            log.log('error', 'Couldnt read the file:' + harFile);
            callback(undefined, err);
          } else {
            var harJson;
            var btJson;

            try {
              btJson = JSON.parse(btData);
              harJson = JSON.parse(harData);
            } catch (e) {
              return callback(undefined, e);
            }

            callback({
              'browser': browser,
              'browsertime': btJson,
              'har': harJson
            }, undefined);
          }
        });
      }
    });
  });
}
