const { messageTypes } = require('.');
module.exports = {
  host: {
    describe: 'The Matrix host.',
    group: 'Matrix'
  },
  accessToken: {
    describe: 'The Matrix access token.',
    group: 'Matrix'
  },
  room: {
    describe:
      'The default Matrix room. It is alsways used. You can override the room per message type using --matrix.rooms',
    group: 'Matrix'
  },
  messages: {
    describe:
      'Choose what type of message to send to Matrix. There are two types of messages: Error messages and budget messages. Errors are errors that happens through the tests (failures like strarting a test) and budget is test failing against your budget.',
    choices: messageTypes,
    default: messageTypes,
    group: 'Matrix'
  },

  rooms: {
    describe:
      'Send messages to different rooms. Current message types are [' +
      messageTypes +
      ']. If you want to send error messages to a specific room use --matrix.rooms.error ROOM',
    group: 'Matrix'
  }
};
