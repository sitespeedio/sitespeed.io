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

var data_path = path.join(config.run.absResultDir, config.dataDir);

module.exports = {
  analyze: function(urls, callback) {
    fs.mkdirSync(path.join(data_path, 'webpagetest'));

    var queue = async.queue(analyzeUrl, 1);
    var errors = {};
    var pageData = {};

    var wpt = ((config.webpagetestKey) ? new WebPageTest(config.webpagetestUrl,config.webpagetestKey):
    new WebPageTest(config.webpagetestUrl));


    urls.forEach(function(u) {
      queue.push({
        "url": u,"wpt": wpt
      }, function(data, err) {
        if (err) {
          log.log('error', 'Error running WebPageTest: ' + err);
          errors[u] = err;
        } else
          pageData[u] = data;
      });
    });

    queue.drain = function() {
      callback(undefined, {'type': 'webpagetest', 'data':pageData, 'errors': errors});
    };
  }
};

function analyzeUrl(args, asyncDoneCallback) {
  var url = args.url;
  var wpt = args.wpt;

  log.log('info', 'Running WebPageTest ' + url);
    wpt.runTest(url, config.webpagetest, function(err, data) {

        console.log(err);


        var jsonPath = path.join(config.run.absResultDir, config.dataDir,
          'webpagetest',
          util.getUrlHash(url) + '-webpagetest.json');

        fs.writeFile(jsonPath, JSON.stringify(data), function(err) {
          if (err) {
            log.log('error', "WebPageTest coudn't store file for url " + url + '(' +
              err + ')');
            asyncDoneCallback(undefined, err);

          }
          else asyncDoneCallback(data, undefined);
        });

    });
}
