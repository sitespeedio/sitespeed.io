'use strict';

let merge = require('lodash.merge'),
  path = require('path'),
  Promise = require('bluebird'),
  browsertime = require('browsertime'),
  log = require('intel'),
  coach = require('webcoach');

const browserScripts = browsertime.browserScripts;

const defaultOptions = {
  browsertime: {
    statistics: true,
    experimental: {
      nativeHar: true
    }
  }
};

function parseUserScripts(scripts) {
  if (!Array.isArray(scripts))
    scripts = [scripts];

  return Promise.reduce(scripts, (results, script) =>
      browserScripts.findAndParseScripts(path.resolve(script), 'custom')
        .then((scripts) => merge(results, scripts)),
    {});
}

function addAdditionalScripts(scripts) {
  const additionalScriptsPath = path.resolve(__dirname, 'scripts', 'crawler');
  const additionalScripts = browserScripts.parseScriptDirectory(additionalScriptsPath);
  return Promise.resolve(scripts)
    .then((scripts) => additionalScripts
      .then((additionalScripts) => scripts.concat(additionalScripts)));
}

function addCoachScripts(scripts) {
  const advice = coach.getDomAdvice();

  return Promise.resolve(scripts)
    .then((scripts) => advice
      .then((script) => {
        return {
          coachAdvice: script
        };
      })
      .then((scriptObject) => {
        scripts['coach'] = scriptObject;
        return scripts;
      }));
}

module.exports = {
  analyzeUrl(url, options) {
    options = merge({}, defaultOptions, options);

    const scriptCategories = browserScripts.allScriptCategories;
    let scriptsByCategory = browserScripts.getScriptsForCategories(scriptCategories);

    if (options.script) {
      const userScripts = parseUserScripts(options.script);
      scriptsByCategory = Promise.join(scriptsByCategory, userScripts,
        (scriptsByCategory, userScripts) => merge(scriptsByCategory, userScripts));
    }

    if (options.browsertime.crawl) {
      scriptsByCategory = addAdditionalScripts(scriptsByCategory);
    }

    if (options.browsertime.coach) {
      scriptsByCategory = addCoachScripts(scriptsByCategory);
    }

    let engine = new browsertime.Engine(options.browsertime);
    log.info('Starting ' + options.browsertime.browser + ' for analysing ' + url);
    return engine.start()
      .then(() => engine.run(url, scriptsByCategory))
      .finally(() => engine.stop());
  }
};
