'use strict';

const builder = require('junit-report-builder'),
  urlParser = require('url'),
  merge = require('lodash.merge');


exports.writeJunit = function(results) {
  // lets have one suite per URL
  const urls = Object.keys(merge({}, results.failing, results.working));

  for (const url of urls) {
    const parsedUrl = urlParser.parse(url);
    const fineUrl = parsedUrl.hostname.replace(/\./g, '_') + '.' + parsedUrl.path.replace(/\./g, '_').replace(/\//g, '_');
    const suite = builder.testSuite().name('sitespeed.io' + '.' + fineUrl );

    for (const result of results.failing[url]) {
      suite.testCase()
        .className(fineUrl)
        .name(result.type + result.metric)
        .failure('Value is ' + result.value + ' and limit ' + result.limit);
    }

    for (const result of results.working[url]) {
      suite.testCase()
        .className(fineUrl)
        .name(result.type + result.metric)
        .standardOutput('Value is ' + result.value + ' and limit ' + result.limit);
    }

  }
  builder.writeTo('junit.xml');
}
