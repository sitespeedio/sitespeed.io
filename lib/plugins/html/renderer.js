'use strict';

const jade = require('jade'),
  fs = require('fs'),
  Promise = require('bluebird'),
  path = require('path');

Promise.promisifyAll(fs);

const basePath = path.resolve(__dirname, 'templates');

const templateCache = {};

function getTemplate(templateName) {
  if (!templateName.endsWith('.jade'))
    templateName = templateName + '.jade';

  const template = templateCache[templateName];

  if (template) {
    return Promise.resolve(template);
  }

  const filename = path.resolve(basePath, templateName);
  return fs.readFileAsync(filename, 'utf-8')
    .then((source) => {
      const template = jade.compile(source, {filename});
      templateCache[templateName] = template;
      return template;
    });
}

module.exports = {
  renderTemplate(templateName, locals) {
    return getTemplate(templateName)
      .then((template) => template(locals));
  }
};
