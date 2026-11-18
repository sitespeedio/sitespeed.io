export function addOptions(yargs) {
  yargs
    .option('browsertime.android.gnirehtet', {
      alias: ['gnirehtet', 'browsertime.gnirehtet'],
      type: 'boolean',
      default: false,
      describe:
        'Start gnirehtet and reverse tethering the traffic from your Android phone.',
      group: 'Android'
    })
    .option('browsertime.android.enabled', {
      alias: ['android.enabled'],
      type: 'boolean',
      default: false,
      describe:
        'Short key to use Android. Will automatically use com.android.chrome for Chrome and stable Firefox. If you want to use another Chrome version, use --chrome.android.package'
    })
    .option('browsertime.android.rooted', {
      alias: ['androidRooted', 'browsertime.androidRooted'],
      type: 'boolean',
      default: false,
      describe:
        'If your phone is rooted you can use this to set it up following Mozillas best practice for stable metrics.',
      group: 'Android'
    })
    .option('browsertime.android.batteryTemperatureLimit', {
      alias: [
        'androidBatteryTemperatureLimit',
        'browsertime.androidBatteryTemperatureLimit'
      ],
      type: 'integer',
      describe:
        'Do the battery temperature need to be below a specific limit before we start the test?',
      group: 'Android'
    })
    .option('browsertime.android.batteryTemperatureWaitTimeInSeconds', {
      alias: [
        'androidBatteryTemperatureWaitTimeInSeconds',
        'browsertime.androidBatteryTemperatureWaitTimeInSeconds'
      ],
      type: 'integer',
      default: 120,
      describe:
        'How long time to wait (in seconds) if the androidBatteryTemperatureWaitTimeInSeconds is not met before the next try',
      group: 'Android'
    })
    .option('browsertime.android.verifyNetwork', {
      alias: ['androidVerifyNetwork', 'browsertime.androidVerifyNetwork'],
      type: 'boolean',
      default: false,
      describe:
        'Before a test start, verify that the device has a Internet connection by pinging 8.8.8.8 (or a configurable domain with --androidPingAddress)',
      group: 'Android'
    });
}
