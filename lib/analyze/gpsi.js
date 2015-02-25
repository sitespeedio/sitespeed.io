/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var path = require('path'),
    util = require('../util/util'),
    fs = require('fs'),
    inspect = require('util').inspect,
    pagespeed = require('gpagespeed'),
    winston = require('winston'),
    async = require('async');

module.exports = {
  analyze: function(urls, config, callback) {
    var log = winston.loggers.get('sitespeed.io');
    var gpsiResultDir = path.join(config.run.absResultDir, config.dataDir, 'gpsi');
    fs.mkdir(gpsiResultDir, function(err) {
      if (err) {
        log.error('Couldn\'t create gpsi result dir: %s %s', gpsiResultDir, inspect(err));
        callback(err, {
          'type': 'gpsi',
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
          }, function(error, data) {
            if (error) {
              log.error('Error running gpsi: %s', inspect(error));
              errors[u] = error;
            } else {
              pageData[u] = data;
            }
          });
        });

        queue.drain = function() {
          callback(undefined, {
            'type': 'gpsi',
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
  var opts = {
    url: url,
    strategy: config.profile,
    key: config.gpsiKey
  };
  var log = winston.loggers.get('sitespeed.io');

  log.info('Running Google Page Speed Insights for %s', url);

  pagespeed(opts, function(err, data) {

    if (err) {
      log.error('Error running gpsi for url %s (%s)', url, inspect(err));
      return asyncDoneCallback(err);
    }

    log.verbose('Got the following from GPSI:' + JSON.stringify(data));

    if (data.error) {
      // TODO parse the error
      log.error('Error running gpsi:' + url + '(' + JSON.stringify(data) + ')');
      return asyncDoneCallback(data.error);
    }

    var jsonPath = path.join(config.run.absResultDir, config.dataDir,
        'gpsi',
        util.getFileName(url) + '-gpsi.json');

    fs.writeFile(jsonPath, JSON.stringify(data), function(error) {
      if (error) {
        log.error('GPSI couldn\'t store file for url %s (%s)', url, inspect(error));
        return asyncDoneCallback(error);
      }

      return asyncDoneCallback(undefined, data);
    });
  });
}
