/**
* Sitespeed.io - How speedy is your site? (https://www.sitespeed.io)
* Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
* and other contributors
* Released under the Apache 2.0 License
*/
'use strict';

var path = require('path'),
util = require('../util/util'),
fs = require('fs'),
inspect = require('util').inspect,
WebPageTest = require('webpagetest'),
winston = require('winston'),
async = require('async');

module.exports = {
  analyze: function(urls, config, callback) {
    var log = winston.loggers.get('sitespeed.io');
    var wptResultDir = path.join(config.run.absResultDir, config.dataDir, 'webpagetest');
    fs.mkdir(wptResultDir, function(err) {

      if (err) {
        log.log('error', 'Could not create the WPT result dir: ' + wptResultDir + ' ' + inspect(err));
        callback(err, {
          'type': 'webpagetest',
          'data': {},
          'errors': {}
        });
      } else {
        var queue = async.queue(analyzeUrl, config.threads);
        var errors = {};
        var pageData = {};

        var wpt = ((config.wptKey) ? new WebPageTest(config.wptHost, config.wptKey) :
        new WebPageTest(config.wptHost));

        if (!Array.isArray(config.wptConfig)) {
          config.wptConfig = [config.wptConfig];
        }

        urls.forEach(function(u) {
          var allRuns = [];
          config.wptConfig.forEach(function (wptConf) {
            queue.push({
              'url': u,
              'wpt': wpt,
              'config': config,
              'wptConf': wptConf
            }, function(data, error) {
              if (error) {
                log.log('error', 'Error running WebPageTest: ' + inspect(error));
                errors[u] = error;
              } else {
                allRuns.push(data);
              }
            });
          });
          pageData[u] = allRuns;
        });

        queue.drain = function() {
          callback(undefined, {
            'type': 'webpagetest',
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
  var wpt = args.wpt;
  var config = args.config;
  var wptConfig = args.wptConf;
  var log = winston.loggers.get('sitespeed.io');
  var wptScript = args.config.wptScript;

  if (wptScript) {
    url = wptScript.split('{{{URL}}}').join(url);
  }

  // these are the default options, they will be
  // overriden with what we have in the config.wptConfig
  // per run
  var wptOptions = ({
    pollResults: 10,
    timeout: 600,
    firstViewOnly: false,
    runs: config.no,
    private: true,
    aftRenderingTime: true,
    location: 'Dulles:Chrome',
    connectivity: 'Cable',
    video: true
  });

  if (config.wptCustomMetrics) {
    wptOptions.custom = config.wptCustomMetrics;
  }

  // set basic auth if it is configured
  if (config.basicAuth) {
    wptOptions.login = config.basicAuth.split(':')[0];
    wptOptions.password = config.basicAuth.split(':')[1];
  }

  // then add the ones from the supplied configuration
  if (wptConfig) {
    Object.keys(wptConfig).forEach(function(key) {
      if (wptConfig.hasOwnProperty(key)) {
        wptOptions[key] = wptConfig[key];
      }
    });
  }

  log.log('info', 'Running WebPageTest ' + args.url, wptOptions);
  wpt.runTest(url, wptOptions, function(err, data) {

    log.verbose('Got the following from WebPageTest:' + JSON.stringify(data));

    // end if we get an error
    if (err) {
      log.log('error', 'WebPageTest couldn\'t fetch info for url ' + url + inspect(err));
      return asyncDoneCallback(undefined, err);
    }

    var wptKey = util.getWPTKey(wptOptions.location, wptOptions.connectivity);
    var id = data.response.data.testId;
    var har;

    async.parallel({
      fetchWaterfall: function(cb) {
        var waterfallOptions = {
          dataURI: false,
          colorByMime: true,
          width: 1140
        };
        wpt.getWaterfallImage(id, waterfallOptions, function(wtfIErr, waterfall, info2) {
          if (wtfIErr) {
            log.log('error', 'WebPageTest couldn\'t get waterfall image ' + wtfIErr + ' ' + info2);
          }
          var wstream = fs.createWriteStream(path.join(config.run.absResultDir, config.dataDir,
            'webpagetest', util.getFileName(args.url) + wptKey + '-waterfall.png'));

            // wstream.on('finish', function () {
            // });
            wstream.write(waterfall);
            wstream.end();
            cb();
          });
        },
        fetchRepeatWaterfall: function(cb) {
          var waterfallOptions = {
            dataURI: false,
            colorByMime: true,
            repeatView: true,
            width: 1140
          };
          wpt.getWaterfallImage(id, waterfallOptions, function(err2, waterfallRepeat, info3) {

            if (err2) {
              log.log('error', 'WebPageTest couldn\'t get repeat waterfall image ' + err2 + ' ' + info3);
            }

            var wstream = fs.createWriteStream(path.join(config.run.absResultDir, config.dataDir,
              'webpagetest', util.getFileName(args.url) + wptKey + '-waterfall-repeat.png'));

              wstream.on('finish', function() {
                // console.log('Wrote waterfall');
              });
              wstream.write(waterfallRepeat);
              wstream.end();
              cb();
            });
          },
          fetchHar: function(cb) {
            wpt.getHARData(id, {}, function(err3, harData) {
              if (err3) {
                log.log('error', 'WebPageTest couldn\'t get HAR (' +
                JSON.stringify(err3) + ')');
                cb(err3);
              } else {
                har = harData;
                var harPath = path.join(config.run.absResultDir, config.dataDir,
                  'webpagetest',
                  util.getFileName(args.url) + wptKey + '-wpt.har');
                  fs.writeFile(harPath, JSON.stringify(harData), function(err4) {
                    if (err4) {
                      log.log('error', 'WebPageTest couldn\'t write the HAR (' +
                      JSON.stringify(err4) + ')');
                      cb(err4);
                    } else {
                      cb();
                    }
                  });
                }

              });
            },
            storeWptData: function(cb) {
              var jsonPath = path.join(config.run.absResultDir, config.dataDir,
                'webpagetest',
                util.getFileName(args.url) + wptKey + '-webpagetest.json');
                fs.writeFile(jsonPath, JSON.stringify(data), cb);
              }
            },
            function(err5, results) {
              if (err5) {
                asyncDoneCallback(undefined, err5);
              } else {
                asyncDoneCallback({
                  'wpt': data,
                  'har': har
                }, undefined);
              }
            });
          });
        }
