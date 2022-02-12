module.exports = {
  key: {
    describe:
      'You need to use a key to get data from CrUx. Get the key from https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started#APIKey',
    group: 'CrUx'
  },
  enable: {
    default: true,
    describe:
      'Enable the CrUx plugin. This is on by defauly but you also need the Crux key. If you chose to disable it with this key, set this to false and you can still use the CrUx key in your configuration.',
    group: 'CrUx'
  },
  formFactor: {
    default: 'ALL',
    type: 'string',
    choices: ['ALL', 'DESKTOP', 'PHONE', 'TABLET'],
    describe:
      'A form factor is the type of device on which a user visits a website.',
    group: 'CrUx'
  },
  collect: {
    default: 'ALL',
    type: 'string',
    choices: ['ALL', 'URL', 'ORIGIN'],
    describe:
      'Choose what data to collect. URL is data for a specific URL, ORIGIN for the domain and ALL for both of them',
    group: 'CrUx'
  }
};
