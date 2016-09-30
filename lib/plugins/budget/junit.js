'use strict';

const builder = require('junit-report-builder'),
  urlParser = require('url'),
  merge = require('lodash.merge');


exports.writeJunit = function(results) {
  // lets have one suite per URL
  const urls = Object.keys(merge({}, results.failing, results.working));

  for (const url of urls) {
    const parsedUrl = urlParser.parse(url)
    const suite = builder.testSuite().name('sitespeed.io' + '.' + parsedUrl.hostname.replace(/\./g, '_') + parsedUrl.path);

    for (const result of results.failing[url]) {
      suite.testCase()
        .className(result.type)
        .name(result.metric)
        .failure('Value was ' + result.value + ' with limit ' + result.limit);
    }

    for (const result of results.working[url]) {
      suite.testCase()
        .className(result.type)
        .name(result.metric);
    }

  }
  builder.writeTo('junit.xml');
}
