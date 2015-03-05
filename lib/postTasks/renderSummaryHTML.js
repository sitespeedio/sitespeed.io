/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var async = require('async'),
  render = require('../util/htmlRenderer'),
  util = require('../util/util'),
  winston = require('winston');

exports.task = function(result, config, cb) {
  var log = winston.loggers.get('sitespeed.io');

  if (config.html) {
    // TODO change to reduce
    var filtered = result.aggregates.filter(function(box) {
      return (config.summaryBoxes.indexOf(box.id) > -1);
    }).sort(function(box, box2) {
      return config.summaryBoxes.indexOf(box.id) - config.summaryBoxes.indexOf(box2.id);
    });
    var summaryData = {
      'aggregates': filtered,
      'config': config,
      'numberOfPages': result.numberOfAnalyzedPages,
      'pageMeta': {
        'title': 'Summary of the sitespeed.io result for ' + util.getGenericTitle(config),
        'description': 'An executive summary of the tested pages.',
        'isSummary': true
      }
    };

    var detailedData = {
      'aggregates': result.aggregates,
      'config': config,
      'numberOfPages': result.numberOfAnalyzedPages,
      'pageMeta': {
        'title': 'In details summary of the sitespeed.io result for ' + util.getGenericTitle(config),
        'description': 'The summary in details.',
        'isDetailedSummary': true
      }
    };

    async.parallel({
        writeSummaryFile: function(callback) {
          render('site-summary', summaryData, config.run.absResultDir, callback, 'index.html');
        },
        writeDetailedSummaryFile: function(callback) {
          render('detailed-site-summary', detailedData, config.run.absResultDir, callback);
        }
      },
      function(err, results) {
        if (err) {
          log.error('Could not write summary files ' + err);
        }
        cb();
      });
  } else {
    cb();
  }
};
