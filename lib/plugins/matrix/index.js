'use strict';

const throwIfMissing = require('../../support/util').throwIfMissing;
const log = require('intel').getLogger('sitespeedio.plugin.matrix');
const path = require('path');
const cliUtil = require('../../cli/util');
const send = require('./send');
module.exports = {
  name() {
    return path.basename(__dirname);
  },
  get cliOptions() {
    return require(path.resolve(__dirname, 'cli.js'));
  },
  open(context, options = {}) {
    this.matrixOptions = options.matrix || {};
    log.info('Starting the matrix plugin');
    throwIfMissing(options.matrix, ['accessToken', 'host', 'room'], 'matrix');
  },
  async processMessage(message) {
    const options = this.matrixOptions;
    switch (message.type) {
      case 'error': {
        const text = `Error from ${message.source} ${
          message.url ? message.url : ''
        } with error ${message.data}`;
        try {
          const answer = await send(
            options.host,
            options.room,
            options.accessToken,
            text
          );
          log.debug('Got %j from the matrix server', answer);
        } catch (e) {
          // TODO what todo?
        }
        break;
      }
      case 'budget.result': {
        //  We have failing URLs in the budget
        if (Object.keys(message.data.failing).length > 0) {
          const failingURLs = Object.keys(message.data.failing);
          let text = '<b>Budget failing:</b> </br>';
          for (let url of failingURLs) {
            text += `<p>${url} : `;
            for (let failing of message.data.failing[url]) {
              text += `${failing.metric} with value ${
                failing.friendlyValue
              } and the limit ${failing.friendlyLimit}</p>`;
            }
            text += `</br>`;
          }
          await send(options.host, options.room, options.accessToken, text);
        }
      }
    }
  },
  get config() {
    return cliUtil.pluginDefaults(this.cliOptions);
  }
};
