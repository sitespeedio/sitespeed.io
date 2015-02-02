/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var spawn = require('cross-spawn'),
  path = require('path'),
  urlParser = require('url'),
  winston = require('winston'),
  EOL = require('os').EOL,
  fs = require('fs'),
  async = require('async');

module.exports.crawl = function(url, config, callback) {
  var pUrl, args = [
    '-Xmx' + config.memory + 'm',
    '-Xms' + config.memory + 'm'
  ];

  var log = winston.loggers.get('sitespeed.io');
  var urlFile = path.join(config.run.absResultDir, 'urls.txt');
  var errorUrlFile = path.join(config.run.absResultDir, 'errorurls.txt');

  if (config.basicAuth) {
    pUrl = urlParser.parse(url);
    var port = pUrl.port || 80;
    if (pUrl.protocol === 'https:') {
      port = 443;
    }
    args.push('-Dcom.soulgalore.crawler.auth=' + pUrl.hostname + ':' + port + ':' + config.basicAuth);
  }
  if (config.proxy) {
    pUrl = urlParser.parse(config.proxy);
    args.push('-Dcom.soulgalore.crawler.proxy=' + pUrl.protocol + pUrl.host);
  }

  var requestHeaders = '';
  // add extra request headers
  if (config.requestHeaders) {
    Object.keys(config.requestHeaders).forEach(function (key) {
      requestHeaders += key + ':' + config.requestHeaders[key] + '@';
    });
  }

  args.push('-cp',
    path.join(__dirname, 'crawler-1.5.14-full.jar'),
    'com.soulgalore.crawler.run.CrawlToFile',
    '-u',
    config.url,
    '-l',
    config.deep,
    '-f',
    urlFile,
    '-ef',
    errorUrlFile,
    '-rh',
    requestHeaders + 'User-Agent:' + config.userAgent);

  if (config.containInPath) {
    args.push('-p', config.containInPath);
  }

  if (config.skip) {
    args.push('-np', config.skip);
  }

  var crawl = spawn('java', args);

  crawl.stdout.on('data', function(data) {
    log.info('Output from the crawl: %s', data.toString());
  });

  crawl.stderr.on('data', function(data) {
    var s = data.toString();
    // JAVA_TOOL_OPTIONS is not an error, but still written to stderr.
    if (s.indexOf('Picked up JAVA_TOOL_OPTIONS:') === 0) {
      return;
    }
    log.error('Error from the crawl: %s', s);
  });

  crawl.on('close', function(code) {
    // the crawler always return code ok today, hmm
    var okUrls = [];
    var errorUrls = {};

    async.parallel([
            function(cb) {
              // Url file might be non-existing, in case of no successful urls
              fs.readFile(urlFile, function(err, data) {
                if (!err) {
                  okUrls = data.toString().split(EOL);
                  okUrls.pop();
                }

                return cb();
              });
            },
          function(cb) {
            // Error file might be non-existing, in case of no errors
            fs.readFile(errorUrlFile, function(err, data) {
              if (!err) {
                data.toString().split(EOL).forEach(function(theUrl) {
                  if (theUrl) {
                    var urlAndReason = theUrl.split(',');
                    errorUrls[urlAndReason[1]] = urlAndReason[0];
                  }
                });
              }

              return cb();
            });
          }
        ],
        function() {
          return callback(okUrls, errorUrls);
        });
  });
  };
