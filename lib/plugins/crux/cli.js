module.exports = {
  key: {
    describe:
      'You need to use a key to get data from CrUx. Get the key from https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started#APIKey',
    group: 'CrUx'
  },
  formFactor: {
    default: 'ALL',
    type: 'string',
    choices: ['ALL', 'DESKTOP', 'PHONE', 'TABLET'],
    describe:
      'A form factor is the type of device on which a user visits a website.',
    group: 'CrUx'
  }
};
