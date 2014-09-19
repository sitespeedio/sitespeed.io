var builder = require('xmlbuilder'),
  fs = require('fs-extra'),
  path = require('path'),
  async = require('async'),
  log = require('winston'),
  util = require('../util');

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
        'name': result.title,
        'status': result.value ? result.value : 'unknown'
      });

      if (!result.isOk) {
        var failure = testCase.ele('failure', {
          'type': 'failed',
          'message': result.description ? result.description : 'unknown'
        });
        // failure.txt(comps);
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

  fs.writeFile(this.filename, xml, function(err) {
    if (err) {
      log.log('error', 'Couldn\'t write JUnit xml file' + this.filename);
      throw err;
    }
    cb();
  });

};

module.exports = JUnitTestSuites;