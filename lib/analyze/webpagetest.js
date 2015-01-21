/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

var path = require('path'),
  util = require('../util/util'),
  inspect = require('util').inspect,
  fs = require('fs'),
  WebPageTest = require('webpagetest'),
  winston = require('winston'),
  async = require('async');

module.exports = {
  analyze: function(urls, config, callback) {
    var log = winston.loggers.get('sitespeed.io');
    var wptResultDir = path.join(config.run.absResultDir, config.dataDir, 'webpagetest');
    fs.mkdir(wptResultDir, function(err) {

      if (err) {
        log.log('error', 'Could not create the WPT result dir: ' + wptResultDir + ' ' + err);
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

        urls.forEach(function(u) {
          queue.push({
            'url': u,
            'wpt': wpt,
            'config': config
          }, function(err, data) {
            if (err) {
              log.log('error', 'Error running WebPageTest: ' + err);
              errors[u] = err;
            } else {
              //Always return an array for consistency in how we process aggregators
              if (!Array.isArray(data.wpt.response.data.run)) {
                data.wpt.response.data.run = [data.wpt.response.data.run];
              }
              pageData[u] = data;
            }
          });
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
  var log = winston.loggers.get('sitespeed.io');

  var wptOptions = ({
    pollResults: 10,
    timeout: 600,
    firstViewOnly: false,
    runs: config.no,
    private: true,
    aftRenderingTime: true,
    location: 'Dulles:Chrome',
    video: true
  });

  // set basic auth if it is configured
  if (config.basicAuth) {
    wptOptions.login = config.basicAuth.split(':')[0];
    wptOptions.password = config.basicAuth.split(':')[1];
  }

  // then add the ones from the supplied configuration
  if (config.wptConfig) {
    Object.keys(config.wptConfig).forEach(function(key) {
      wptOptions[key] = config.wptConfig[key];
    });
  }
  log.info('Running WebPageTest %s', url, wptOptions);

  wpt.runTest(url, wptOptions, function(err, data) {

    if (err) {
      log.error('WebPageTest couldn\'t fetch info for url %s (%s)', url, inspect(err));
      return asyncDoneCallback(err);
    }

    /* Removing this since it looks to come from the latest WPT, need to read the latest changelog
    if (!data.response) {
      log.error('WebPageTest didn\'t deliver a response for url %s (%s)', url, data);
      return asyncDoneCallback(new Error('No response from WPT.'));
    }
    */

    var id = data.response.data.testId;
    var har;

    async.parallel({
        fetchWaterfall: function(cb) {
          var waterfallOptions = {
            dataURI: false,
            colorByMime: true,
            width: 1140
          };
          wpt.getWaterfallImage(id, waterfallOptions, function(err, data, info) {

            var wstream = fs.createWriteStream(path.join(config.run.absResultDir, config.dataDir,
              'webpagetest', util.getFileName(url) + '-waterfall.png'));

            // wstream.on('finish', function () {
            // });
            wstream.write(data);
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
          wpt.getWaterfallImage(id, waterfallOptions, function(err, data, info) {

            var wstream = fs.createWriteStream(path.join(config.run.absResultDir, config.dataDir,
              'webpagetest', util.getFileName(url) + '-waterfall-repeat.png'));

            wstream.on('finish', function() {
              // console.log('Wrote waterfall');
            });
            wstream.write(data);
            wstream.end();
            cb();
          });
        },
        fetchHar: function(cb) {
          wpt.getHARData(id, {}, function(err, data) {
            if (err) {
              log.error('WebPageTest couldn\'t get HAR (%s)', inspect(err));
              return cb(err);
            }

            har = data;
            var harPath = path.join(config.run.absResultDir, config.dataDir,
                'webpagetest',
                util.getFileName(url) + '-wpt.har');
            fs.writeFile(harPath, JSON.stringify(data), function(err) {
              if (err) {
                log.error('WebPageTest couldn\'t write the HAR (%s)', inspect(err));
              }

              return cb(err);
            });
          });
        },
        storeWptData: function(cb) {
          var jsonPath = path.join(config.run.absResultDir, config.dataDir,
            'webpagetest',
            util.getFileName(url) + '-webpagetest.json');
          fs.writeFile(jsonPath, JSON.stringify(data), cb);
        }
      },
      function(err, results) {
        if (err) {
          return asyncDoneCallback(err);
        }

        return asyncDoneCallback(undefined, {
          'wpt': data,
          'har': har
        });
      });
  });
}
