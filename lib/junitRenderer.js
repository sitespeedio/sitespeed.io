/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var builder = require('xmlbuilder'),
  config = require('./conf'),
  fs = require('fs-extra'),
  path = require('path'),
  util = require('./util');

module.exports = JUnitRenderer;

function JUnitRenderer(collector) {
  this.collector = collector;
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
  generateRuleTestSuitePerPage(url, score, rules, ruleDictionary, this.ruleTestsuites);

  if (browserTimeData)
    generateBrowserTimeTestSuitePerPage(browserTimeData, this.timingTestsuites);

};

function generateBrowserTimeTestSuitePerPage(browserTimeData, timingTestsuites) {

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
                .pages[url][timing]);
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
                default [timing]);
            }
          });
        });
      }
    }
  });
}

function generateTimingTestCase(stats, timing, run, testsuite, limit) {
  var browser = run.pageData.browserName,
    version = run.pageData.browserVersion,
    url = run.pageData.url;

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
  testsuites) {
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
  if (isFailure("overall", score)) {
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

    if (isFailure(rule[i], rules[rule[i]].score)) {
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

function isFailure(ruleid, value) {
  if (config.thresholds) {
    if (config.thresholds.hasOwnProperty(ruleid))
      return (value < config.thresholds[ruleid]);
    else return (value < config.threshold);
  } else return (value < config.threshold);
}

JUnitRenderer.prototype.renderAfterFullAnalyse = function() {
  // create testsuites and write to disk
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

  renderXMLFile(rulesXML,"junit.xml");
  renderXMLFile(timingXML,"junit-timings.xml");

};

function renderXMLFile(xml, fileName) {
    console.log("Writing " + fileName);
    fs.outputFileSync(path.join(config.run.absResultDir,fileName), xml);
}
