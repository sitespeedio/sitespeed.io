/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var spawn = require('cross-spawn'),
  path = require('path'),
  urlParser = require('url'),
  winston = require('winston'),
  EOL = require('os').EOL,
  fs = require('fs'),
  async = require('async');

module.exports.crawl = function(url, config, callback) {
  var pUrl, args = [
    '-Xmx' +  config.memory + 'm',
    '-Xms' +  config.memory + 'm'
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
    args.push('-Dcom.soulgalore.crawler.auth=' + pUrl.hostname +':' + port + ':' + config.basicAuth);
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
    path.join(__dirname, 'crawler-1.5.14-SNAPSHOT-full.jar'),
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
    log.log('info', 'Output from the crawl:' +  data);
  });

  crawl.stderr.on('data', function(data) {
    log.log('error', 'Error from the crawl:' +  data);
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
                data.toString().split(EOL).forEach(function(url) {
                  if (url) {
                    var urlAndReason = url.split(',');
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
