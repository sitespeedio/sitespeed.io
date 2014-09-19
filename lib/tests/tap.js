/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var fs = require('fs-extra'),
  tap = require('tape');

exports.writeTap = function(fileName, results, cb) {

  var outStream = fs.createWriteStream(fileName);
  tap.createStream().pipe(outStream);
  var i = 0;
  results.forEach(function(result) {
    tap(result.type + ' ' + result.title + ' ' + result.url, function(t) {
      i++;
      if (result.skipped) {
        t.skip(result.description);
      } else {
        t.ok(result.isOk, result.description);
      }
      t.end();
      // check if last and fire callback
      if (i === results.length) {
        cb();
      }
    });
  });

}