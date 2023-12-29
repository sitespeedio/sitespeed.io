import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compileFile, compile } from 'pug';
import intel from 'intel';

const log = intel.getLogger('sitespeedio.plugin.html');
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const basePath = resolve(__dirname, 'templates');

const templateCache = {};

function getTemplate(templateName) {
  if (!templateName.endsWith('.pug')) templateName = templateName + '.pug';

  const template = templateCache[templateName];
  if (template) {
    return template;
  }

  const filename = resolve(basePath, templateName);
  const renderedTemplate = compileFile(filename);

  templateCache[templateName] = renderedTemplate;
  return renderedTemplate;
}

export function renderTemplate(templateName, locals) {
  try {
    return getTemplate(templateName)(locals);
  } catch (error) {
    log.error('Could not generate %s, %s', templateName, error.message);
  }
}
export function addTemplate(templateName, templateString) {
  const compiledTemplate = compile(templateString);
  templateCache[templateName + '.pug'] = compiledTemplate;
}
