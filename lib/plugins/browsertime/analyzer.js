import path from 'node:path';
import { get, set, merge } from '../../support/objectPath.js';
import coach from 'coach-core';
import { BrowsertimeEngine, browserScripts } from 'browsertime';
const { getDomAdvice } = coach;
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('plugin.browsertime');

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
    docker: options.docker,
    headless: options.headless
  };

  if (options.requestheader) {
    preWarmOptions['requestheader'] = options.requestheader;
  }

  if (options.cookie) {
    preWarmOptions['cookie'] = options.cookie;
  }

  if (options.android.enabled) {
    preWarmOptions.android = options.android;
    const chromeDevice = get(options, 'chrome.android.deviceSerial');
    const firefoxDevice = get(options, 'firefox.android.deviceSerial');
    if (options.browser === 'chrome') {
      set(preWarmOptions, 'chrome.android.package', 'com.android.chrome');
    }
    if (chromeDevice) {
      set(preWarmOptions, 'chrome.android.deviceSerial', chromeDevice);
    } else if (firefoxDevice) {
      set(preWarmOptions, 'firefox.android.deviceSerial', firefoxDevice);
    }
  }

  const safariIos = get(options, 'safari.ios');
  const safariDeviceName = get(options, 'safari.deviceName');
  const safariDeviceUDID = get(options, 'safari.deviceUDID ');

  if (safariIos) {
    set(preWarmOptions, 'safari.ios', true);
    if (safariDeviceName) {
      set(preWarmOptions, 'safari.deviceName', safariDeviceName);
    }
    if (safariDeviceUDID) {
      set(preWarmOptions, 'safari.deviceUDID', safariDeviceUDID);
    }
  }

  if (options.gnirehtet) {
    preWarmOptions.gnirehtet = options.gnirehtet;
  }

  const engine = new BrowsertimeEngine(preWarmOptions);

  await engine.start();
  log.info('Start pre-testing/warming ' + urls);
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
      options.firefox.collectMozLog = true;
    } else if (options.browser === 'chrome') {
      options.chrome.enableTraceScreenshots = true;
      // v8.cpu_profiler feeds cpu.functionCosts; blink.debug emits
      // SelectorStats for cpu.selectorStats. Both add overhead, which
      // is fine here — this run is not measured.
      options.chrome.traceCategory = [
        'disabled-by-default-v8.cpu_profiler',
        'disabled-by-default-blink.debug'
      ];
      options.chrome.timeline = true;
      options.chrome.coverage = true;
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
  const profileResult = await (scriptOrMultiple
    ? traceEngine.runMultiple(urls, scriptsByCategory)
    : traceEngine.run(urls, scriptsByCategory));
  await traceEngine.stop();
  return profileResult;
}

// Move per-URL coverage from the profile run into the main result so the
// HTML report (which reads from the main browsertime.json) finds it.
// Only triggered when the main iterations didn't collect coverage
// themselves — if the user passed --chrome.coverage on top of
// --enableProfileRun, the per-iteration samples are what they asked
// for, leave them alone.
function mergeProfileCoverage(mainResult, profileResult) {
  if (!Array.isArray(mainResult) || !Array.isArray(profileResult)) return;
  for (const [i, pr] of profileResult.entries()) {
    const main = mainResult[i];
    if (!main || !pr || !pr.coverage) continue;
    if (pr.coverage.js.length === 0 && pr.coverage.css.length === 0) {
      continue;
    }
    const existing = main.coverage;
    if (
      existing &&
      ((existing.js && existing.js.length > 0) ||
        (existing.css && existing.css.length > 0))
    ) {
      continue;
    }
    // The profile run is a single side iteration: publish its sample as
    // one object marked with source instead of a one-element array
    // pretending to be keyed by iteration.
    main.coverage = {
      source: 'profileRun',
      js: pr.coverage.js[0],
      css: pr.coverage.css[0]
    };
  }
}

// Per-module CPU (cpu.moduleCosts) needs the trace and the
// coverage-derived bundle boundaries from the same iteration — with
// --enableProfileRun only the profile run has both. Publish that
// sample the same marked-sample way as the coverage above, unless the
// main iterations collected their own.
function mergeProfileModuleCosts(mainResult, profileResult) {
  if (!Array.isArray(mainResult) || !Array.isArray(profileResult)) return;
  for (const [i, pr] of profileResult.entries()) {
    const main = mainResult[i];
    const profileCpu = pr && pr.cpu && pr.cpu[0];
    if (!main || !profileCpu || !profileCpu.moduleCosts) continue;
    if (main.cpu && main.cpu.some(c => c && c.moduleCosts)) continue;
    main.moduleCosts = {
      source: 'profileRun',
      bundles: profileCpu.moduleCosts
    };
  }
}

// Per-function JS cost (cpu.functionCosts) comes from the V8 sampling
// profiler, whose trace category only the profile run enables. Same
// marked-sample publication as the module costs above, unless the
// main iterations collected their own.
function mergeProfileFunctionCosts(mainResult, profileResult) {
  if (!Array.isArray(mainResult) || !Array.isArray(profileResult)) return;
  for (const [i, pr] of profileResult.entries()) {
    const main = mainResult[i];
    const profileCpu = pr && pr.cpu && pr.cpu[0];
    if (!main || !profileCpu || !profileCpu.functionCosts) continue;
    if (main.cpu && main.cpu.some(c => c && c.functionCosts)) continue;
    main.functionCosts = {
      source: 'profileRun',
      functions: profileCpu.functionCosts
    };
  }
}

// Generic form of the merges above for the trace analyses that need
// no reshaping (cpu.selectorStats, cpu.styleInvalidations,
// cpu.timers): publish the profile run's sample under a `data` key,
// marked with its source, unless the main iterations collected the
// same analysis themselves. `always` publishes even then — the timer
// sample needs it, because only the profile run has the coverage
// bundles that resolve install sites to modules, so its sample is
// richer than the measured one even when both exist. The HTML picks.
function mergeProfileCpuAnalysis(mainResult, profileResult, key, always) {
  if (!Array.isArray(mainResult) || !Array.isArray(profileResult)) return;
  for (const [i, pr] of profileResult.entries()) {
    const main = mainResult[i];
    const profileCpu = pr && pr.cpu && pr.cpu[0];
    if (!main || !profileCpu || !profileCpu[key]) continue;
    if (!always && main.cpu && main.cpu.some(c => c && c[key])) continue;
    main[key] = {
      source: 'profileRun',
      data: profileCpu[key]
    };
  }
}

async function parseUserScripts(scripts) {
  const { browserScripts } = await import('browsertime');
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
    for (const [name, script] of Object.entries(scripts.scripts)) {
      set(scriptsByCategory, scripts.category + '.' + name, script);
    }
  }
  return scriptsByCategory;
}

function setupAsynScripts(asyncScripts) {
  const allAsyncScripts = {};
  // For all different script in the array
  for (let scripts of asyncScripts) {
    // and then for all scripts in that category
    for (const [name, script] of Object.entries(scripts.scripts)) {
      set(allAsyncScripts, scripts.category + '.' + name, script);
    }
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

  // enableProfileRun tells this plugin to make one extra run, but
  // inside browsertime the same flag marks the current run as the
  // profile run (extra-run trace naming, suppressed result log line).
  // Keep it away from the main engine and hand it back to the extra
  // run below, so measured traces keep their trace-N.json names and
  // the profile trace cannot overwrite the first iteration's.
  const makeProfileRun = btOptions.enableProfileRun;
  btOptions.enableProfileRun = false;

  const engine = new BrowsertimeEngine(btOptions);

  const asyncScript =
    pluginAsyncScripts.length > 0
      ? await setupAsynScripts(pluginAsyncScripts)
      : undefined;

  let mainResult;
  try {
    await engine.start();
    mainResult = await (scriptOrMultiple
      ? engine.runMultiple(url, scriptsByCategory, asyncScript)
      : engine.run(url, scriptsByCategory, asyncScript));
  } finally {
    await engine.stop();
    if (makeProfileRun || btOptions.enableVideoRun) {
      if (makeProfileRun) {
        btOptions.enableProfileRun = true;
      }
      const profileResult = await extraProfileRun(
        url,
        btOptions,
        scriptOrMultiple
      );
      if (makeProfileRun && btOptions.browser === 'chrome') {
        mergeProfileCoverage(mainResult, profileResult);
        mergeProfileModuleCosts(mainResult, profileResult);
        mergeProfileFunctionCosts(mainResult, profileResult);
        mergeProfileCpuAnalysis(mainResult, profileResult, 'selectorStats');
        mergeProfileCpuAnalysis(
          mainResult,
          profileResult,
          'styleInvalidations',
          true
        );
        mergeProfileCpuAnalysis(mainResult, profileResult, 'timers', true);
      }
    }
  }
  return mainResult;
}
