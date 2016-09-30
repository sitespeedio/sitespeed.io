'use strict';

const tap = require('tape'),
  fs = require('fs'),
  EOL = require('os').EOL;

exports.writeTap = function(results) {

  const tapOutput = fs.createWriteStream('budget.tap');
  tap.createStream().pipe(tapOutput);

  for (const resultType of Object.keys(results)) {
    const urls = Object.keys(results.failing);

    for (const url of urls) {
      for (const result of results.failing[url]) {
        tap(result.type + result.metric + ' ' + url, function(t) {
          let extra = '';
          if (resultType === 'failing') {
            extra = ' --- message: The limit is ' + result.limit + EOL;
          }
          t.ok(resultType === 'failing' ? false : true, '(' + result.value + ') ' + result.metric + ' [' + url + ']' + EOL + extra);
          t.end();
        })
      }
    }
  }
}
