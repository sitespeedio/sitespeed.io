'use strict';

const throwIfMissing = require('../../support/util').throwIfMissing;
const log = require('intel').getLogger('sitespeedio.plugin.matrix');
const path = require('path');
const get = require('lodash.get');
const cliUtil = require('../../cli/util');
const send = require('./send');

function getBrowserData(data) {
  return `${data.browser.name} ${data.browser.version} ${get(
    data,
    'android.model',
    ''
  )} ${get(data, 'android.androidVersion', '')} ${get(
    data,
    'android.id',
    ''
  )} `;
}

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  get cliOptions() {
    return require(path.resolve(__dirname, 'cli.js'));
  },
  open(context, options = {}) {
    this.matrixOptions = options.matrix || {};
    this.options = options;
    log.info('Starting the matrix plugin');
    throwIfMissing(options.matrix, ['accessToken', 'host', 'room'], 'matrix');
    this.resultUrls = context.resultUrls;
  },
  async processMessage(message) {
    const options = this.matrixOptions;
    switch (message.type) {
      case 'browsertime.browser': {
        this.browserData = message.data;
        break;
      }
      case 'error': {
        if (options.messages.indexOf('error') > -1) {
          const text = `&#9888;&#65039; Error from <b>${
            message.source
          }</b> testing ${message.url ? message.url : ''} <pre>${
            message.data
          }</pre>`;
          const room = get(options, 'rooms.error', options.room);
          try {
            const answer = await send(
              options.host,
              room,
              options.accessToken,
              text
            );
            log.debug('Got %j from the matrix server', answer);
          } catch (e) {
            // TODO what todo?
          }
        }
        break;
      }
      case 'budget.result': {
        if (options.messages.indexOf('budget') > -1) {
          //  We have failing URLs in the budget
          if (Object.keys(message.data.failing).length > 0) {
            const failingURLs = Object.keys(message.data.failing);
            let text = `<h1>&#9888;&#65039; Budget failing (${
              failingURLs.length
            } URLs)</h1>`;
            text += `<p><b>${get(this.options, 'name', '') +
              '</b> '}${getBrowserData(this.browserData)}</p>`;
            for (let url of failingURLs) {
              text += `<h5>&#10060; ${url}`;
              if (this.resultUrls.hasBaseUrl()) {
                text += ` (<a href="${this.resultUrls.absoluteSummaryPagePath(
                  url
                )}index.html">result</a>)</h5>`;
              } else {
                text += '</h5>';
              }
              text += '<ul>';
              for (let failing of message.data.failing[url]) {
                text += `<li>${failing.metric} : ${failing.friendlyValue} (${
                  failing.friendlyLimit
                })</li>`;
              }
              text += `</ul>`;
            }
            const room = get(options, 'rooms.budget', options.room);
            await send(options.host, room, options.accessToken, text);
          }
        }
        break;
      }
    }
  },
  get config() {
    return cliUtil.pluginDefaults(this.cliOptions);
  },
  get messageTypes() {
    return ['error', 'budget'];
  }
};
