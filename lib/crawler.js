/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var spawn = require('child_process').spawn,
  path = require('path'),
  config = require('./conf'),
  urlParser = require('url'),
  log = require('winston'),
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
    // console.log('child process exited with code ' + code);
    var okUrls = fs.readFileSync(urlFile).toString().split("\n");
    okUrls.pop();
    // TODO handle URL & error type
    var errorUrls = {};

    if (fs.existsSync(errorUrlFile)) {
      var lines = fs.readFileSync(errorUrlFile).toString().split("\n");
      lines.forEach(function (line) {
        // skip empty lines
        if (line) {
        var urlAndReason = line.split(',');
        errorUrls[urlAndReason[1]] = urlAndReason[0];
      }
      });
    }
    callback(okUrls, errorUrls);
  });

};
