import { resolve } from 'node:path';
import merge from 'lodash.merge';
import forEach from 'lodash.foreach';
import set from 'lodash.set';
import get from 'lodash.get';
import coach from 'coach-core';
import { BrowsertimeEngine, browserScripts } from 'browsertime';
const { getDomAdvice } = coach;
import intel from 'intel';
const log = intel.getLogger('plugin.browsertime');

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

  const engine = new BrowsertimeEngine(preWarmOptions);

  await engine.start();
  log.info('Start pre-testing/warming' + urls);
  await (scriptOrMultiple
    ? engine.runMultiple(urls, {})
    : engine.run(urls, {}));
  await engine.stop();
  log.info('Pre-testing done, closed the browser.');
  return delay(options.preWarmServerWaitTime || 5000);
}

async function extraProfileRun(urls, options, scriptOrMultiple) {
  log.info('Make one extra run to collect trace/video information');
  options.iterations = 1;
  if (options.enableProfileRun) {
    if (options.browser === 'firefox') {
      options.firefox.geckoProfiler = true;
    } else if (options.browser === 'chrome') {
      options.chrome.enableTraceScreenshots = true;
      options.chrome.traceCategory = ['disabled-by-default-v8.cpu_profiler'];
      options.chrome.timeline = true;
    }
  }
  if (options.enableVideoRun) {
    options.video = true;
    options.visualMetrics = true;
  } else {
    options.video = false;
    options.visualMetrics = false;
  }
  const traceEngine = new BrowsertimeEngine(options);
  const scriptCategories = await browserScripts.allScriptCategories();
  let scriptsByCategory =
    await browserScripts.getScriptsForCategories(scriptCategories);

  await traceEngine.start();
  await (scriptOrMultiple
    ? traceEngine.runMultiple(urls, scriptsByCategory)
    : traceEngine.run(urls, scriptsByCategory));
  await traceEngine.stop();
}

async function parseUserScripts(scripts) {
  const { browserScripts } = await import('browsertime');
  if (!Array.isArray(scripts)) scripts = [scripts];
  const allUserScripts = {};
  for (let script of scripts) {
    let myScript = await browserScripts.findAndParseScripts(
      resolve(script),
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
  const coachAdvice = await getDomAdvice();
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

export async function analyzeUrl(
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
  const scriptCategories = await browserScripts.allScriptCategories();
  let scriptsByCategory =
    await browserScripts.getScriptsForCategories(scriptCategories);

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

  const engine = new BrowsertimeEngine(btOptions);

  const asyncScript =
    pluginAsyncScripts.length > 0
      ? await setupAsynScripts(pluginAsyncScripts)
      : undefined;

  try {
    await engine.start();
    return await (scriptOrMultiple
      ? engine.runMultiple(url, scriptsByCategory, asyncScript)
      : engine.run(url, scriptsByCategory, asyncScript));
  } finally {
    await engine.stop();
    if (btOptions.enableProfileRun || btOptions.enableVideoRun) {
      await extraProfileRun(url, btOptions, scriptOrMultiple);
    }
  }
}
