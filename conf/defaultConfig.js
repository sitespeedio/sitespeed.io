var defaultConfig = {
  supportedBrowsers: ['chrome', 'ie', 'firefox', 'phantomjs'],
  deep: 1,
  threads: 5,
  memory: 1024,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36',
  yslow: 'phantomjs/yslow-3.1.8-sitespeed.js',
  ruleSet: 'sitespeed.io-desktop',
  limitFile: '../conf/desktopRules.json',
  profile: 'desktop',
  no: 3,
  threshold: 90,
  graphitePort: 2003,
  graphiteNamespace: 'sitespeed.io',
  graphiteData: 'all',
  resultBaseDir: 'sitespeed-result',
  viewPort: '1280x800'
};

module.exports = defaultConfig;