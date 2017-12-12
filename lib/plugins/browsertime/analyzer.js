'use strict';

const merge = require('lodash.merge'),
  forEach = require('lodash.foreach'),
  path = require('path'),
  Promise = require('bluebird'),
  browsertime = require('browsertime'),
  log = require('intel').getLogger('sitespeedio.plugin.browsertime'),
  set = require('lodash.set'),
  coach = require('webcoach');

const browserScripts = browsertime.browserScripts;

const defaultBrowsertimeOptions = {
  statistics: true
};

const chromeIphoneEmulationOptions = {
  mobileEmulation: {
    deviceName: 'iPhone 6'
  }
};

const iphone6UserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_3 like Mac OS X) AppleWebKit/536.26 ' +
  '(KHTML, like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25';

function parseUserScripts(scripts) {
  if (!Array.isArray(scripts)) scripts = [scripts];

  return Promise.reduce(
    scripts,
    (results, script) =>
      browserScripts
        .findAndParseScripts(path.resolve(script), 'custom')
        .then(scripts => merge(results, scripts)),
    {}
  );
}

function addCoachScripts(scripts) {
  return Promise.join(scripts, coach.getDomAdvice(), (scripts, advice) => {
    scripts.coach = {
      coachAdvice: advice
    };
    return scripts;
  });
}

function addExtraScripts(scriptsByCategory, pluginScripts) {
  return Promise.join(
    scriptsByCategory,
    pluginScripts,
    (scriptsByCategory, pluginScripts) => {
      // For all different script in the array
      for (var scripts of pluginScripts) {
        // and then for all scripts in that category
        forEach(scripts.scripts, function(script, name) {
          set(scriptsByCategory, scripts.category + '.' + name, script);
        });
      }
      return scriptsByCategory;
    }
  );
}

function setupAsynScripts(asyncScripts) {
  var allAsyncScripts = {};
  // For all different script in the array
  for (var scripts of asyncScripts) {
    // and then for all scripts in that category
    forEach(scripts.scripts, function(script, name) {
      set(allAsyncScripts, scripts.category + '.' + name, script);
    });
  }
  return allAsyncScripts;
}

module.exports = {
  analyzeUrl(url, options, pluginScripts, pluginAsyncScripts) {
    const btOptions = merge({}, defaultBrowsertimeOptions, options);

    // set mobile options
    if (options.mobile) {
      btOptions.viewPort = '360x640';
      if (btOptions.browser === 'chrome') {
        btOptions.chrome = merge(
          {},
          btOptions.chrome,
          chromeIphoneEmulationOptions
        );
      } else {
        btOptions.userAgent = iphone6UserAgent;
      }
    }

    const scriptCategories = browserScripts.allScriptCategories;
    let scriptsByCategory = browserScripts.getScriptsForCategories(
      scriptCategories
    );

    if (btOptions.script) {
      const userScripts = parseUserScripts(btOptions.script);
      scriptsByCategory = Promise.join(
        scriptsByCategory,
        userScripts,
        (scriptsByCategory, userScripts) =>
          merge(scriptsByCategory, userScripts)
      );
    }

    if (btOptions.coach) {
      scriptsByCategory = addCoachScripts(scriptsByCategory);
    }
    scriptsByCategory = addExtraScripts(scriptsByCategory, pluginScripts);

    let engine = new browsertime.Engine(btOptions);
    log.info(
      'Starting %s for analysing %s %s time(s)',
      btOptions.browser,
      url,
      btOptions.iterations
    );

    const asyncScript =
      pluginAsyncScripts.length > 0
        ? setupAsynScripts(pluginAsyncScripts)
        : undefined;

    return engine
      .start()
      .then(() => engine.run(url, scriptsByCategory, asyncScript))
      .finally(() => engine.stop());
  }
};
