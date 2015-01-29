/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var builder = require('xmlbuilder');

function JUnitTestSuites(filename, config) {
  this.config = config;
  this.filename = filename;
  this.testSuites = builder.create('testsuites', {
    version: '1.0',
    encoding: 'UTF-8'
  });
}

JUnitTestSuites.prototype.addSuite = function(name, results) {

  var testsuite = this.testSuites.ele('testsuite', {
    'name': 'sitespeed.io.' + name + '.' + results[0].url.replace(/\./g, '_'),
    'tests': (results.length)
  });

  var failures = 0;
  var skipped = 0;

  results.forEach(function(result) {

    if (result.skipped) {
      skipped++;

    } else {

      var testCase = testsuite.ele('testcase');

      testCase.att({
        'name': result.title + ' (' + result.value + ')',
        'status': result.value ? result.value : 'unknown',
        'time': result.type === 'timings' ? (result.value / 1000) : ''
      });

      if (!result.isOk) {
        var failure = testCase.ele('failure', {
          'type': 'failed',
          'message': result.description ? result.description : 'unknown'
        });
        if (result.components) {
          failure.txt(JSON.stringify(decodeURIComponent(result.components)));
        }
        failures++;
      }
    }

  });

  testsuite.att('failures', failures);
  testsuite.att('skipped', skipped);
};

JUnitTestSuites.prototype.render = function(cb) {
  var xml = this.testSuites.end({
    pretty: true,
    indent: '  ',
    newline: '\n'
  });

  console.log(xml);
  cb();
};

module.exports = JUnitTestSuites;
