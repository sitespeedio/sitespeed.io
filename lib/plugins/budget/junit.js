'use strict';

const builder = require('junit-report-builder'),
  urlParser = require('url'),
  log = require('intel').getLogger('sitespeedio.plugin.budget'),
  path = require('path'),
  merge = require('lodash.merge');

exports.writeJunit = function(results, dir) {
  // lets have one suite per URL
  const urls = Object.keys(merge({}, results.failing, results.working));

  for (const url of urls) {
    const parsedUrl = urlParser.parse(url);
    const fineUrl =
      parsedUrl.hostname.replace(/\./g, '_') +
      '.' +
      parsedUrl.path.replace(/\./g, '_').replace(/\//g, '_');
    const suite = builder.testSuite().name('sitespeed.io' + '.' + fineUrl);

    if (results.failing[url]) {
      for (const result of results.failing[url]) {
        suite
          .testCase()
          .className(fineUrl)
          .name(result.type + '.' + result.metric)
          .failure(
            result.metric +
              ' is ' +
              result.value +
              ' and limit ' +
              result.limitType +
              ' ' +
              result.limit +
              ' ' +
              url
          );
      }
    }

    if (results.working[url]) {
      for (const result of results.working[url]) {
        suite
          .testCase()
          .className(fineUrl)
          .name(result.type + '.' + result.metric)
          .standardOutput(
            result.metric +
              ' is ' +
              result.value +
              ' and limit ' +
              result.limitType +
              ' ' +
              result.limit +
              ' ' +
              url
          );
      }
    }
  }
  const file = path.join(dir, 'junit.xml');
  log.info('Write junit budget to %s', path.resolve(file));
  builder.writeTo(file);
};
