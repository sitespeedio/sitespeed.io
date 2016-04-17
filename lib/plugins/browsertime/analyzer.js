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
    
    // set mobile options
    if (options.mobile) {
      options.browsertime.viewPort = '360x640';
      if (options.browsertime.browser === 'chrome') {
        options.browsertime.chrome = {
          mobileEmulation: {
            deviceName: 'Apple iPhone 6'
          }
        };
      } else {
        options.browsertime.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_3 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25';
      }
    }

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
