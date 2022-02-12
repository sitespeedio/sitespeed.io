'use strict';

const pug = require('pug');
const path = require('path');
const log = require('intel').getLogger('sitespeedio.plugin.html');
const basePath = path.resolve(__dirname, 'templates');

const templateCache = {};

function getTemplate(templateName) {
  if (!templateName.endsWith('.pug')) templateName = templateName + '.pug';

  const template = templateCache[templateName];
  if (template) {
    return template;
  }

  const filename = path.resolve(basePath, templateName);
  const renderedTemplate = pug.compileFile(filename);

  templateCache[templateName] = renderedTemplate;
  return renderedTemplate;
}

module.exports = {
  renderTemplate(templateName, locals) {
    try {
      return getTemplate(templateName)(locals);
    } catch (e) {
      log.error('Could not generate %s, %s', templateName, e.message);
    }
  },
  addTemplate(templateName, templateString) {
    const compiledTemplate = pug.compile(templateString);
    templateCache[templateName + '.pug'] = compiledTemplate;
  }
};
