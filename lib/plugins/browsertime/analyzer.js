'use strict';

const merge = require('lodash.merge');
const forEach = require('lodash.foreach');
const path = require('path');
const browsertime = require('browsertime');
const set = require('lodash.set');
const get = require('lodash.get');
const coach = require('coach-core');
const log = require('intel').getLogger('plugin.browsertime');

const browserScripts = browsertime.browserScripts;

const defaultBrowsertimeOptions = {
  statistics: true
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const iphone6UserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_3 like Mac OS X) AppleWebKit/536.26 ' +
  '(KHTML, like Gecko) Version/6.0 Mobile/10B329 Safari/8536.25';

async function preWarmServer(urls, options, scriptOrMultiple) {
  const preWarmOptions = {
    browser: options.browser,
    iterations: 1,
    xvfb: options.xvfb,
    android: options.android,
    docker: options.docker,
    headless: options.headless
  };
  const chromeDevice = get(options, 'chrome.android.deviceSerial');
  const firefoxDevice = get(options, 'firefox.android.deviceSerial');
  const safariIos = get(options, 'safari.ios');
  const safariDeviceName = get(options, 'safari.deviceName');
  const safariDeviceUDID = get(options, 'safari.deviceUDID ');

  if (options.android && options.browser === 'chrome') {
    set(preWarmOptions, 'chrome.android.package', 'com.android.chrome');
  }
  if (chromeDevice) {
    set(preWarmOptions, 'chrome.android.deviceSerial', chromeDevice);
  } else if (firefoxDevice) {
    set(preWarmOptions, 'firefox.android.deviceSerial', firefoxDevice);
  }

  if (safariIos) {
    set(preWarmOptions, 'safari.ios', true);
    if (safariDeviceName) {
      set(preWarmOptions, 'safari.deviceName', safariDeviceName);
    }
    if (safariDeviceUDID) {
      set(preWarmOptions, 'safari.deviceUDID', safariDeviceUDID);
    }
  }

  const engine = new browsertime.Engine(preWarmOptions);

  await engine.start();
  log.info('Start pre-testing/warming' + urls);
  if (scriptOrMultiple) {
    await engine.runMultiple(urls, {});
  } else {
    await engine.run(urls, {});
  }
  await engine.stop();
  log.info('Pre-testing done, closed the browser.');
  return delay(options.preWarmServerWaitTime || 5000);
}

async function parseUserScripts(scripts) {
  if (!Array.isArray(scripts)) scripts = [scripts];
  const allUserScripts = {};
  for (let script of scripts) {
    let myScript = await browserScripts.findAndParseScripts(
      path.resolve(script),
      'custom'
    );
    if (!myScript['custom']) {
      myScript = { custom: Object.values(myScript)[0] };
    }
    merge(allUserScripts, myScript);
  }
  return allUserScripts;
}

async function addCoachScripts(scripts) {
  const coachAdvice = await coach.getDomAdvice();
  scripts.coach = {
    coachAdvice: coachAdvice
  };
  return scripts;
}

function addExtraScripts(scriptsByCategory, pluginScripts) {
  // For all different script in the array
  for (let scripts of pluginScripts) {
    // and then for all scripts in that category
    forEach(scripts.scripts, function (script, name) {
      set(scriptsByCategory, scripts.category + '.' + name, script);
    });
  }
  return scriptsByCategory;
}

function setupAsynScripts(asyncScripts) {
  const allAsyncScripts = {};
  // For all different script in the array
  for (let scripts of asyncScripts) {
    // and then for all scripts in that category
    forEach(scripts.scripts, function (script, name) {
      set(allAsyncScripts, scripts.category + '.' + name, script);
    });
  }
  return allAsyncScripts;
}

module.exports = {
  async analyzeUrl(
    url,
    scriptOrMultiple,
    pluginScripts,
    pluginAsyncScripts,
    options
  ) {
    const btOptions = merge({}, defaultBrowsertimeOptions, options);

    // set mobile options
    if (options.mobile) {
      btOptions.viewPort = '360x640';
      if (btOptions.browser === 'chrome' || btOptions.browser === 'edge') {
        const emulation = get(
          btOptions,
          'chrome.mobileEmulation.deviceName',
          'Moto G4'
        );
        btOptions.chrome.mobileEmulation = {
          deviceName: emulation
        };
      } else {
        btOptions.userAgent = iphone6UserAgent;
      }
    }
    const scriptCategories = await browserScripts.allScriptCategories;
    let scriptsByCategory = await browserScripts.getScriptsForCategories(
      scriptCategories
    );

    if (btOptions.script) {
      const userScripts = await parseUserScripts(btOptions.script);
      scriptsByCategory = merge(scriptsByCategory, userScripts);
    }

    if (btOptions.coach) {
      scriptsByCategory = addCoachScripts(scriptsByCategory);
    }
    scriptsByCategory = await addExtraScripts(scriptsByCategory, pluginScripts);

    if (btOptions.preWarmServer) {
      await preWarmServer(url, btOptions, scriptOrMultiple);
    }

    const engine = new browsertime.Engine(btOptions);

    const asyncScript =
      pluginAsyncScripts.length > 0
        ? await setupAsynScripts(pluginAsyncScripts)
        : undefined;

    try {
      await engine.start();
      if (scriptOrMultiple) {
        const res = await engine.runMultiple(
          url,
          scriptsByCategory,
          asyncScript
        );
        return res;
      } else {
        const res = await engine.run(url, scriptsByCategory, asyncScript);
        return res;
      }
    } finally {
      await engine.stop();
    }
  }
};
