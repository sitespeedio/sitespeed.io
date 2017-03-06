'use strict';

let merge = require('lodash.merge'),
  path = require('path'),
  pick = require('lodash.pick'),
  isEmpty = require('lodash.isempty'),
  forEach = require('lodash.foreach'),
  Promise = require('bluebird'),
  browsertime = require('browsertime'),
  log = require('intel'),
  coach = require('webcoach'),
  StorageManager = require('browsertime/lib/support/storageManager');

const browserScripts = browsertime.browserScripts;

const defaultBrowsertimeOptions = {
  statistics: true
};

const chromeIphoneEmulationOptions = {
  mobileEmulation: {
    deviceName: 'Apple iPhone 6'
  }
};

const iphone6UserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_3 like Mac OS X) AppleWebKit/536.26 ' +
  '(KHTML, like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25';

function parseUserScripts(scripts) {
  if (!Array.isArray(scripts))
    scripts = [scripts];

  return Promise.reduce(scripts, (results, script) =>
      browserScripts.findAndParseScripts(path.resolve(script), 'custom')
        .then((scripts) => merge(results, scripts)),
    {});
}

function addCoachScripts(scripts) {
  return Promise.join(scripts, coach.getDomAdvice(),
    (scripts, advice) => {
      scripts.coach = {
        coachAdvice: advice
      };
      return scripts;
    });
}

module.exports = {
  analyzeUrl(url, options) {
    const btOptions = merge({}, defaultBrowsertimeOptions, options);
    merge(btOptions, {verbose: options.verbose});

    // set mobile options
    if (options.mobile) {
      btOptions.viewPort = '360x640';
      if (btOptions.browser === 'chrome') {
        btOptions.chrome = merge({}, btOptions.chrome, chromeIphoneEmulationOptions);
      } else {
        btOptions.userAgent = iphone6UserAgent;
      }
    }

    const scriptCategories = browserScripts.allScriptCategories;
    let scriptsByCategory = browserScripts.getScriptsForCategories(scriptCategories);

    if (btOptions.script) {
      const userScripts = parseUserScripts(btOptions.script);
      scriptsByCategory = Promise.join(scriptsByCategory, userScripts,
        (scriptsByCategory, userScripts) => merge(scriptsByCategory, userScripts));
    }

    if (btOptions.coach) {
      scriptsByCategory = addCoachScripts(scriptsByCategory);
    }

    let engine = new browsertime.Engine(btOptions);
    log.info('Starting %s for analysing %s %s time(s)', btOptions.browser, url, btOptions.iterations);
    return engine.start()
      .then(() => engine.run(url, scriptsByCategory))
      .then(function(result) {
        let saveOperations = [];

        const storageManager = new StorageManager(url, options);
        const harName = (options.har) ? (options.har) : 'browsertime';
        const jsonName = (options.output) ? (options.output) : 'browsertime';
        const btData = pick(result, ['info', 'browserScripts', 'statistics', 'visualMetrics']);
        if (!isEmpty(btData)) {
          saveOperations.push(storageManager.writeJson(jsonName + '.json', btData));
        }
        if (result.har) {
          saveOperations.push(storageManager.writeJson(harName + '.har', result.har));
        }
        forEach(result.extraJson, (value, key) =>
          saveOperations.push(storageManager.writeJson(key, value)));
        forEach(result.screenshots, (value, index) =>
          saveOperations.push(storageManager.writeData(`screenshot-${index}.png`, value)));

        return Promise.all(saveOperations)
          .then(() => {
            log.info('Wrote data to %s', path.relative(process.cwd(), storageManager.directory));
            return merge(result, {extraJsonDir: storageManager.directory});
          });
      })
      .finally(() => engine.stop())
  }
};
