/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var fs = require('fs-extra'),
  hb = require('handlebars'),
  path = require('path'),
  winston = require('winston'),
  minify = require('html-minifier').minify,
  helpers = require('./hbHelpers');

var compiledTemplates = compileTemplates(path.join(__dirname, '../../templates/'));
var compiledPartials = compileTemplates(path.join(__dirname, '../../templates/partials/'));

for (var key in compiledPartials) {
  if (compiledPartials.hasOwnProperty(key)) {
    hb.registerPartial(key, compiledPartials[key]);
  }
}

helpers.registerHelpers();

module.exports = function renderHtmlToFile(template, renderData, absResultDir, cb, fileName,
  optionalPath) {
  fileName = fileName || (template + '.html');
  optionalPath = optionalPath || '';
  var result = compiledTemplates[template](renderData);
  var file = path.join(absResultDir, optionalPath, fileName);
  var log = winston.loggers.get('sitespeed.io');

  var result2 = minify(result, { removeComments: true, collapseWhitespace: true });

  fs.outputFile(file, result2, function(err) {
    if (err) {
      log.log('error', 'Couldn\'t write the file ' + file + ' err:' + err);
    } else {
      log.log('info', 'Wrote file ' + fileName);
    }
    cb(err);
  });
};

function compileTemplates(folderPath) {
  // TODO would be cool to do this async
  var templates = {};
  fs.readdirSync(folderPath).forEach(function(file) {
    if (!fs.lstatSync(path.join(folderPath + file)).isDirectory()) {
      templates[path.basename(file, '.hb')] = hb.compile(fs.readFileSync(path.join(folderPath + file), 'utf8'));
    }
  });
  return templates;
}
