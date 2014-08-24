/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

var path = require('path'),
  config = require('./../conf'),
  util = require('../util'),
  fs = require('fs'),
  WebPageTest = require('webpagetest'),
  log = require('winston'),
  async = require('async');

module.exports = {
  analyze: function(urls, callback) {

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

        var wpt = ((config.wptKey) ? new WebPageTest(config.wptUrl, config.wptKey) :
          new WebPageTest(config.wptUrl));

        urls.forEach(function(u) {
          queue.push({
            'url': u,
            'wpt': wpt
          }, function(data, err) {
            if (err) {
              log.log('error', 'Error running WebPageTest: ' + err);
              errors[u] = err;
            } else {
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

  var wptOptions = ({
    pollResults: 10,
    timeout: 600,
    firstViewOnly: false,
    runs: config.no,
    private: true,
    aftRenderingTime: true,
    location: config.wptLocation,
    video: true
  });

  log.log('info', 'Running WebPageTest ' + url + ' ' + config.wptLocation);

  wpt.runTest(url, wptOptions, function(err, data) {

    if (err) {
      log.log('error', 'WebPageTest couldnt fetch info for url ' + url + '(' +
        JSON.stringify(err) + ')');
      asyncDoneCallback(undefined, err);
      return;
    }

    var id = data.response.data.testId;
    var har;

    async.parallel({
        fetchWaterfall: function(cb) {
            var waterfallOptions = {
                  dataURI:false,
                  colorByMime:true,
                  width: 1140
                };
                wpt.getWaterfallImage(id, waterfallOptions, function(err,data,info) {

              var wstream = fs.createWriteStream(path.join(config.run.absResultDir, config.dataDir,
              'webpagetest', util.getFileName(url) + '-waterfall.png'));

              wstream.on('finish', function () {
                  console.log('Wrote waterfall');
                });
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
                wpt.getWaterfallImage(id, waterfallOptions, function(err,data,info) {

              var wstream = fs.createWriteStream(path.join(config.run.absResultDir, config.dataDir,
              'webpagetest', util.getFileName(url) + '-waterfall-repeat.png'));

              wstream.on('finish', function () {
                  console.log('Wrote waterfall');
                });
              wstream.write(data);
              wstream.end();
              cb();
            });
        },
        fetchHar: function(cb) {
          wpt.getHARData(id, {}, function(err,data) {
            if (err) {
                throw err;
              }
            har = data;
            var harPath = path.join(config.run.absResultDir, config.dataDir,
              'webpagetest',
              util.getFileName(url) + '-wpt.har');
            fs.writeFile(harPath, JSON.stringify(data), function(err) {
            cb();
          });

        });
        },
        storeWptData: function(cb) {
            var jsonPath = path.join(config.run.absResultDir, config.dataDir,
              'webpagetest',
              util.getFileName(url) + '-webpagetest.json');
            fs.writeFile(jsonPath, JSON.stringify(data), function(err) {
            cb();
          });
        },
      },
      function(err, results) {
        if (err) {
          asyncDoneCallback(undefined, err);
        }
        else {
        asyncDoneCallback({'wpt': data, 'har': har}, undefined);
        }
      });
  });
}
