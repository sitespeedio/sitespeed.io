/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var builder = require('xmlbuilder'),
  fs = require('fs-extra'),
  path = require('path'),
  async = require('async'),
  log = require('winston'),
  util = require('./util');

function JUnitRenderer(collector, config) {
  this.collector = collector;
  this.config = config;
  this.ruleTestsuites = builder.create('testsuites', {
    version: '1.0',
    encoding: 'UTF-8'
  });
  this.timingTestsuites = builder.create('testsuites', {
    version: '1.0',
    encoding: 'UTF-8'
  });
}

JUnitRenderer.prototype.renderForEachPage = function(url, pageData) {

  var yslowData = pageData.yslow,
    ruleDictionary = yslowData.dictionary.rules,
    rules = pageData.yslow.g,
    score = pageData.yslow.o,
    browserTimeData = pageData.browsertime;
  generateRuleTestSuitePerPage(url, score, rules, ruleDictionary, this.ruleTestsuites, this.config);

  if (browserTimeData) {
    generateBrowserTimeTestSuitePerPage(browserTimeData, this.timingTestsuites, this.config);
  }

  // TODO add phantomjs timings


};

function generateBrowserTimeTestSuitePerPage(browserTimeData, timingTestsuites, config) {

  browserTimeData.forEach(function(run) {
    var testsuite = timingTestsuites.ele('testsuite', {
      'name': 'sitespeed.io.timings.' + run.pageData.url.replace(/\./g, '_')
    });

    var url = run.pageData.url;

    // First check if we have specific values configured for that URL else use the default ones
    if (config.timingThresholds.pages) {
      if (config.timingThresholds.pages.hasOwnProperty(url)) {

        Object.keys(config.timingThresholds.pages[url]).forEach(function(
          timing) {
          run.statistics.forEach(function(stats) {
            if (stats.name === timing) {
              generateTimingTestCase(stats, timing, run, testsuite,
                config.timingThresholds
                .pages[url][timing], config);
            }
          });
        });
      }
      // Use default values
      else {
        Object.keys(config.timingThresholds.
          default).forEach(function(timing) {
          run.statistics.forEach(function(stats) {
            if (stats.name === timing) {
              generateTimingTestCase(stats, timing, run, testsuite,
                config.timingThresholds.
                default [timing], config);
            }
          });
        });
      }
    }
  });
}

function generateTimingTestCase(stats, timing, run, testsuite, limit, config) {
  var browser = run.pageData.browserName;
  var version = run.pageData.browserVersion;

  // The time in Jenkins needs to be in seconds
  var testCase = testsuite.ele('testcase', {
    'name': timing,
    'time': stats[config.timingThresholds.type] / 1000
  });

  // is it a failure
  if (stats[config.timingThresholds.type] > limit) {
    testCase.ele('failure', {
      'type': 'failedTiming',
      'message': 'The time for ' + timing + ' is ' + stats[
        config.timingThresholds.type] +
        ' ms, that is higher than your limit of ' + limit + ' ms. Using ' +
        browser + ' ' +
        version + ' ' + config.timingThresholds.type + ' value'
    });

  }
}


function generateRuleTestSuitePerPage(url, score, rules, ruleDictionary,
  testsuites, config) {
  var rule = Object.keys(rules);

  var failures = 0,
    skipped = 0;

  var testsuite = testsuites.ele('testsuite', {
    'name': 'sitespeed.io.rules.' + url.replace(/\./g, '_'),
    'tests': (rule.length + 1)
  });
  var overallPageTestCase = testsuite.ele('testcase');

  overallPageTestCase.att({
    'name': 'Overall page score',
    'status': score
  });
  if (isFailure("overall", score, config)) {
    overallPageTestCase.ele('failure', {
      'type': 'failedRule',
      'message': 'The average overall page score ' + score +
        ' is below your limit'
    });
    failures++;
  }


  for (var i = 0; i < rule.length; i++) {

    // is this skippable?
    if (config.skipTest) {
      if (config.skipTest.indexOf(rule[i]) > -1) {
        skipped++;
        continue;
      }
    }

    var testCase = testsuite.ele('testcase', {
      'name': '(' + rule[i] + ') ' + ruleDictionary[rule[i]].name,
      'status': rules[rule[i]].score
    });

    if (isFailure(rule[i], rules[rule[i]].score, config)) {
      failures++;
      var failure = testCase.ele('failure', {
        'type': 'failedRule',
        'message': 'Score ' + score + ' - ' + rules[rule[i]].message
      });

      var comps = '';
      rules[rule[i]].components.forEach(function(comp) {
        comps += util.decodeURIComponent(comp) + '\n';
      });

      failure.txt(comps);
    }

  }

  testsuite.att('failures', failures);
  testsuite.att('skipped', skipped);
}

function isFailure(ruleid, value, config) {
  if (config.thresholds) {
    if (config.thresholds.hasOwnProperty(ruleid)) {
      return (value < config.thresholds[ruleid]);
    }
    else {
      return (value < config.threshold);
    }
  } else {
    return (value < config.threshold);
  }
}

function renderXMLFile(xml, fileName, cb) {
  fs.writeFile(fileName, xml, function(err) {
    if (err) {
      log.log('error', 'Couldn\'t write JUnit xml file' + fileName);
      throw err;
    }
    cb();
  });
}

JUnitRenderer.prototype.renderAfterFullAnalyse = function(cb) {
  // create testsuites and write to disk
  var self = this;
  var rulesXML = this.ruleTestsuites.end({
    pretty: true,
    indent: '  ',
    newline: '\n'
  });
  var timingXML = this.timingTestsuites.end({
    pretty: true,
    indent: '  ',
    newline: '\n'
  });

  async.parallel({
      renderRules: function(callback) {
        renderXMLFile(rulesXML,path.join(config.run.absResultDir,'junit.xml'),callback);
      },
      renderTimings: function(callback) {
        renderXMLFile(timingXML,path.join(config.run.absResultDir, 'junit-timings.xml'),callback);
      }
    },
    function(err, results) {
      if (!err) {
        log.log('info', 'Wrote JUnit result to ' + self.config.run.absResultDir);
      }
      cb();
    });
};

module.exports = JUnitRenderer;
