'use strict';

module.exports = {
  url: {
    describe: 'The URL where to send the webhook.',
    group: 'WebHook'
  },
  messages: {
    describe: 'Choose what type of message to send',
    choices: ['budget', 'errors', 'summary'],
    default: 'summary',
    group: 'WebHook'
  },
  style: {
    describe: 'How to format the content of the webhook.',
    choices: ['html', 'markdown', 'text'],
    default: 'text',
    group: 'WebHook'
  }
};
