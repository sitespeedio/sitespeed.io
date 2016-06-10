'use strict';

const pug = require('pug'),
  fs = require('fs'),
  Promise = require('bluebird'),
  path = require('path');

Promise.promisifyAll(fs);

const basePath = path.resolve(__dirname, 'templates');

const templateCache = {};

function getTemplate(templateName) {
  if (!templateName.endsWith('.pug'))
    templateName = templateName + '.pug';

  const template = templateCache[templateName];

  if (template) {
    return Promise.resolve(template);
  }

  const filename = path.resolve(basePath, templateName);
  return fs.readFileAsync(filename, 'utf-8')
    .then((source) => {
      const renderedTemplate = pug.compile(source, {'filename': filename});
      templateCache[templateName] = renderedTemplate;
      return renderedTemplate;
    });
}

module.exports = {
  renderTemplate(templateName, locals) {
    return getTemplate(templateName)
      .then((template) => template(locals));
  }
};
