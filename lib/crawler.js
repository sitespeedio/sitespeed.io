/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var spawn = require('cross-spawn'),
  path = require('path'),
  config = require('./conf'),
  urlParser = require('url'),
  log = require('winston'),
  EOL = require('os').EOL,
  fs = require('fs');

module.exports.crawl = function(url, callback) {

  var args = [
    '-Xmx' +  config.memory + 'm',
    '-Xms' +  config.memory + 'm'
  ];

  var urlFile = path.join(config.run.absResultDir, 'urls.txt');
  var errorUrlFile = path.join(config.run.absResultDir, 'errorurls.txt');

  if (config.basicAuth) {
    pUrl = urlParser.parse(url);
    args.push('-Dcom.soulgalore.crawler.auth=' + pUrl.hostname +':' + (pUrl.port||80) + ':' + config.basicAuth);
  }
  if (config.proxy) {
    pUrl = urlParser.parse(config.proxy);
    args.push('-Dcom.soulgalore.crawler.proxy=' + pUrl.protocol + pUrl.host);
  }
  args.push('-cp',
    path.join(__dirname, "crawler-1.5.14-SNAPSHOT-full.jar"),
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
    'User-Agent:' + config.userAgent);

  if (config.containInPath)
    args.push('-p', config.containInPath);


  if (config.skip)
    args.push('-np', config.skip);

  var crawl = spawn('java', args);

  crawl.stdout.on('data', function(data) {
    log.log('info', 'Output from the crawl:' +  data);
  });

  crawl.stderr.on('data', function(data) {
    log.log('error', 'Error from the crawl:' +  data);
  });

  crawl.on('close', function(code) {
    // the crawler always return code ok today, hmm
    var errorUrls = {};

    fs.readFile(urlFile, function(err, data) {

      if (err) {
        callback([], {});
      } else {
        var okUrls = data.toString().split(EOL);
        okUrls.pop();

        fs.readFile(errorUrlFile, function(err, data) {
          if (!err) {
            var errorUrls = data.toString().split(EOL);
            errorUrls.forEach(function(url) {
              if (url) {
                var urlAndReason = url.split(',');
                errorUrls[urlAndReason[1]] = urlAndReason[0];
              }
            });
          }
        });
        callback(okUrls, errorUrls);
      }
    });
  });
  };
