import { messageTypes as matrixMessageTypes } from '../../plugins/matrix/index.js';

export function addOptions(yargs) {
  yargs
    .option('matrix.host', {
      describe: 'The Matrix host.',
      group: 'Matrix'
    })
    .option('matrix.accessToken', {
      describe: 'The Matrix access token.',
      group: 'Matrix'
    })
    .option('matrix.room', {
      describe:
        'The default Matrix room. It is alsways used. You can override the room per message type using --matrix.rooms',
      group: 'Matrix'
    })
    .option('matrix.messages', {
      describe:
        'Choose what type of message to send to Matrix. There are two types of messages: Error messages and budget messages. Errors are errors that happens through the tests (failures like strarting a test) and budget is test failing against your budget.',
      choices: matrixMessageTypes(),
      default: matrixMessageTypes(),
      group: 'Matrix'
    })
    .option('matrix.rooms', {
      describe:
        'Send messages to different rooms. Current message types are [' +
        matrixMessageTypes +
        ']. If you want to send error messages to a specific room use --matrix.rooms.error ROOM',
      group: 'Matrix'
    });
}
