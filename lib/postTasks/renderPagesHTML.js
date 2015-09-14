/**
 * Sitespeed.io - How speedy is your site? (https://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var columnsMetaData = require('../../conf/columnsMetaData.json'),
  util = require('../util/util'),
  render = require('../util/htmlRenderer');

exports.task = function(result, config, cb) {
  if (config.html) {
    var includeHar = !!config.browsertime;
    if (config.btConfig && config.btConfig.noProxy) {
      includeHar = false;
    }
    var renderData = {
      'pages': result.pages,
      'columnsMeta': columnsMetaData,
      'config': config,
      'includeHar': includeHar,
      'ruleDictionary': result.ruleDictionary, // TODO
      'numberOfPages': result.numberOfAnalyzedPages,
      'pageMeta': {
        'title': 'Detailed site report for ' + util.getGenericTitle(config),
        'description': 'Data collected for each page.',
        'isPages': true
      }
    };

    render('pages', renderData, config.run.absResultDir, cb);
  } else {
    cb();
  }
};
