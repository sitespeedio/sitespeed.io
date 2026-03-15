export function addOptions(yargs) {
  yargs
    .option('debugMessages', {
      default: false,
      describe:
        'Debug mode logs all internal messages in the message queue to the log.',
      type: 'boolean'
    })
    .option('verbose', {
      alias: ['v'],
      describe:
        'Verbose mode prints progress messages to the console. Enter up to three times (-vvv)' +
        ' to increase the level of detail.',
      type: 'count'
    })
    .option('mobile', {
      describe:
        'Access pages as mobile a fake mobile device. Set UA and width/height. For Chrome it will use device Moto G4.',
      default: false,
      type: 'boolean'
    })
    .option('resultBaseURL', {
      alias: 'resultBaseUrl',
      describe:
        'The base URL to the server serving the HTML result. In the format of https://result.sitespeed.io'
    })
    .option('gzipHAR', {
      describe: 'Compress the HAR files with GZIP.',
      default: false,
      type: 'boolean'
    })
    .option('outputFolder', {
      describe:
        'The folder where the result will be stored. If you do not set it, the result will be stored in "DOMAIN_OR_FILENAME_OR_SLUG/TIMESTAMP"',
      type: 'string'
    })
    .option('copyLatestFilesToBase', {
      default: false,
      describe:
        'Copy the latest screenshots to the root folder (so you can include it in Grafana). Do not work together it --outputFolder.',
      type: 'boolean'
    })
    .option('firstParty', {
      describe:
        'A regex running against each request and categorize it as first vs third party URL. (ex: ".*sitespeed.*"). If you do not set a regular expression parts of the domain from the tested URL will be used: ".*domain.*" '
    })
    .option('urlAlias', {
      describe:
        'Use an alias for the URL (if you feed URLs from a file you can instead have the alias in the file). You need to pass on the same amount of alias as URLs. The alias is used as the name of the URL on the HTML report and in Graphite. Pass on multiple --urlAlias for multiple alias/URLs. This will override alias in a file.',
      type: 'string'
    })
    .option('groupAlias', {
      describe:
        'Use an alias for the group/domain. You need to pass on the same amount of alias as URLs. The alias is used as the name of the group in Graphite. Pass on multiple --groupAlias for multiple alias/groups. This do not work for scripting at the moment.',
      type: 'string'
    })
    .option('utc', {
      describe: 'Use Coordinated Universal Time for timestamps',
      default: false,
      type: 'boolean'
    })
    .option('useHash', {
      describe:
        'If your site uses # for URLs and # give you unique URLs you need to turn on useHash. By default is it turned off, meaning URLs with hash and without hash are treated as the same URL',
      default: false,
      type: 'boolean'
    })
    .option('multi', {
      describe:
        'Test multiple URLs within the same browser session (same cache etc). Only works with Browsertime. Use this if you want to test multiple pages (use journey) or want to test multiple pages with scripts. You can mix URLs and scripts (the order will matter): login.js https://www.sitespeed.io/ logout.js - More details: https://www.sitespeed.io/documentation/sitespeed.io/scripting/',
      default: false,
      type: 'boolean'
    })
    .option('name', {
      describe: 'Give your test a name.'
    })
    .option('logLevel', {
      type: 'string',
      choices: ['trace', 'verbose', 'debug', 'info', 'warning', 'error'],
      describe: 'Manually set the min log level'
    })
    .option('open', {
      alias: ['o', 'view'],
      describe:
        'Open your test result in your default browser (Mac OS or Linux with xdg-open).'
    })
    .option('slug', {
      describe:
        'Give your test a slug. The slug is used when you send the metrics to your data storage to identify the test and the folder of the tests. The max length of the slug is 200 characters and it can only contain a-z A-Z 0-9 and -_ characters.'
    })
    .option('disableAPI', {
      default: false,
      type: 'boolean'
    });
}
