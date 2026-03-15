export function addOptions(yargs) {
  yargs
    .option('browsertime.firefox.includeResponseBodies', {
      alias: 'firefox.includeResponseBodies',
      describe: 'Collect response bodies in the HAR',
      default: 'none',
      choices: ['none', 'all'],
      group: 'Firefox'
    })
    .option('browsertime.firefox.nightly', {
      alias: 'firefox.nightly',
      describe:
        'Use Firefox Nightly. Works on OS X. For Linux you need to set the binary path.',
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.beta', {
      alias: 'firefox.beta',
      describe:
        'Use Firefox Beta. Works on OS X. For Linux you need to set the binary path.',
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.developer', {
      alias: 'firefox.developer',
      describe:
        'Use Firefox Developer. Works on OS X. For Linux you need to set the binary path.',
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.binaryPath', {
      alias: 'firefox.binaryPath',
      describe:
        'Path to custom Firefox binary (e.g. Firefox Nightly). ' +
        'On OS X, the path should be to the binary inside the app bundle, ' +
        'e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin',
      group: 'Firefox'
    })
    .option('browsertime.firefox.preference', {
      alias: 'firefox.preference',
      describe:
        'Extra command line arguments to pass Firefox preferences by the format key:value ' +
        'To add multiple preferences, repeat --firefox.preference once per argument.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.acceptInsecureCerts', {
      alias: 'firefox.acceptInsecureCerts',
      describe: 'Accept insecure certs',
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.memoryReport', {
      alias: 'firefox.memoryReport',
      describe: 'Measure firefox resident memory after each iteration.',
      default: false,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.memoryReportParams.minizeFirst', {
      alias: 'firefox.memoryReportParams.minizeFirst',
      describe:
        'Force a collection before dumping and measuring the memory report.',
      default: false,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckoProfiler', {
      alias: 'firefox.geckoProfiler',
      describe: 'Collect a profile using the internal gecko profiler',
      default: false,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckoProfilerParams.features', {
      alias: 'firefox.geckoProfilerParams.features',
      describe: 'Enabled features during gecko profiling',
      default: 'js,stackwalk,leaf',
      type: 'string',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckoProfilerParams.threads', {
      alias: 'firefox.geckoProfilerParams.threads',
      describe: 'Threads to profile.',
      default: 'GeckoMain,Compositor,Renderer',
      type: 'string',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckoProfilerParams.interval', {
      alias: 'firefox.geckoProfilerParams.interval',
      describe: `Sampling interval in ms.  Defaults to 1 on desktop, and 4 on android.`,
      type: 'number',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckoProfilerParams.bufferSize', {
      alias: 'firefox.geckoProfilerParams.bufferSize',
      describe: 'Buffer size in elements. Default is ~90MB.',
      default: 1_000_000,
      type: 'number',
      group: 'Firefox'
    })
    .option('browsertime.firefox.powerConsumption', {
      alias: 'firefox.powerConsumption',
      type: 'boolean',
      default: false,
      describe:
        'Enable power consumption collection (in Wh). To get the consumption you also need to set firefox.geckoProfilerParams.features to include power.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.geckodriverArgs', {
      alias: 'firefox.geckodriverArgs',
      describe:
        'Flags passed to Geckodriver see https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html. Use it like --firefox.geckodriverArgs="--marionette-port"  --firefox.geckodriverArgs=1027 ',
      type: 'string',
      group: 'Firefox'
    })
    .option('browsertime.firefox.windowRecorder', {
      alias: 'firefox.windowRecorder',
      describe:
        'Use the internal compositor-based Firefox window recorder to emit PNG files for each ' +
        'frame that is a meaningful change.  The PNG output will further be merged into a ' +
        'variable frame rate video for analysis. Use this instead of ffmpeg to record a video (you still need the --video flag).',
      default: false,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.disableSafeBrowsing', {
      alias: 'firefox.disableSafeBrowsing',
      describe: 'Disable safebrowsing.',
      default: true,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.disableTrackingProtection', {
      alias: 'firefox.disableTrackingProtection',
      describe: 'Disable Tracking Protection.',
      default: true,
      type: 'boolean',
      group: 'Firefox'
    })
    .option('browsertime.firefox.android.package', {
      alias: 'firefox.android.package',
      describe:
        'Run Firefox or a GeckoView-consuming App on your Android device. Set to org.mozilla.geckoview_example for default Firefox version. You need to have adb installed to make this work.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.android.activity', {
      alias: 'firefox.android.activity',
      describe: 'Name of the Activity hosting the GeckoView.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.android.deviceSerial', {
      alias: 'firefox.android.deviceSerial',
      type: 'string',
      describe:
        'Choose which device to use. If you do not set it, first device will be used.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.android.intentArgument', {
      alias: 'firefox.android.intentArgument',
      describe:
        'Configure how the Android intent is launched.  Passed through to `adb shell am start ...`; ' +
        'follow the format at https://developer.android.com/studio/command-line/adb#IntentSpec. ' +
        'To add multiple arguments, repeat --firefox.android.intentArgument once per argument.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.profileTemplate', {
      alias: 'firefox.profileTemplate',
      describe:
        'Profile template directory that will be cloned and used as the base of each profile each instance of Firefox is launched against.  Use this to pre-populate databases with certificates, tracking protection lists, etc.',
      group: 'Firefox'
    })
    .option('browsertime.firefox.collectMozLog', {
      alias: 'firefox.collectMozLog',
      type: 'boolean',
      describe: 'Collect the MOZ HTTP log',
      group: 'Firefox'
    });
}
