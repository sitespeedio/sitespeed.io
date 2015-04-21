var defaultConfig = {
  supportedBrowsers: ['chrome', 'firefox', 'headless', 'ie', 'safari'],
  connection: ['mobile3g', 'mobile3gfast', 'cable', 'native'],
  deep: 1,
  threads: 5,
  memory: 256,
  headless: 'phantomjs',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36',
  ruleSet: 'sitespeed.io-desktop',
  profile: 'desktop',
  testData: 'all',
  no: 3,
  graphitePort: 2003,
  graphiteNamespace: 'sitespeed.io',
  graphiteData: 'all',
  resultBaseDir: 'sitespeed-result',
  viewPort: '1280x800',
  waitScript: ' if (window.performance && window.performance.timing)'
          + '{ return ((window.performance.timing.loadEventEnd > 0) && ((new Date).getTime() - window.performance.timing.loadEventEnd > 2000 ));}'
          + ' else { return true;}'
};

module.exports = defaultConfig;
