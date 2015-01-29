/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var tap = require('tape'),
  EOL = require('os').EOL;

exports.writeTap = function(results, cb) {
  var i = 0;
  results.forEach(function(result) {
    tap(result.title + ' ' + result.url, function(t) {
      i++;
      if (result.skipped) {
        t.skip(result.description);
      } else {
        var extra = '';
        if (!result.isOk) {
          extra = ' --- message: ' + result.description + EOL;
          if (result.components) {
            result.components.forEach(function(component) {
              extra += '    - ' +
                decodeURIComponent(component) + EOL;
            });
          }
        }
        t.ok(result.isOk, '(' + result.value + ') ' + result.title + ' [' + result.url + ']' + EOL + extra);
      }
      t.end();
      // check if last and fire callback
      if (i === results.length) {
        cb();
      }
    });
  });

};
