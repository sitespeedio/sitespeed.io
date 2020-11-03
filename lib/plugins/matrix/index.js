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
    this.errorTexts = '';
    this.waitForUpload = false;
  },
  async processMessage(message) {
    const options = this.matrixOptions;
    switch (message.type) {
      case 'browsertime.browser': {
        this.browserData = message.data;
        break;
      }
      case 'gcs.setup':
      case 'ftp.setup':
      case 's3.setup': {
        this.waitForUpload = true;
        break;
      }

      case 'render': {
        if (this.errorTexts !== '') {
          const room = get(options, 'rooms.error', options.room);
          try {
            const answer = await send(
              options.host,
              room,
              options.accessToken,
              this.errorTexts
            );
            log.debug('Got %j from the matrix server', answer);
          } catch (e) {
            // TODO what todo?
          }
        }
        break;
      }
      case 'error': {
        // We can send too many messages to Matrix and get 429 so instead
        // we bulk send them all one time
        if (options.messages.indexOf('error') > -1) {
          this.errorTexts += `&#9888;&#65039; Error from <b>${
            message.source
          }</b> testing ${message.url ? message.url : ''} <pre>${
            message.data
          }</pre>`;
        }
        break;
      }
      case 'budget.result': {
        if (options.messages.indexOf('budget') > -1) {
          let text = '';
          //  We have failing URLs in the budget
          if (Object.keys(message.data.failing).length > 0) {
            const failingURLs = Object.keys(message.data.failing);
            text += `<h1>&#9888;&#65039; Budget failing (${
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
          } else {
            text += `<p><b>&#9888;&#65039; All (${
              message.data.working.length
            } URLs passed the budget. </b></p>`;
            text += `<p><b>${get(this.options, 'name', '') +
              '</b> '}${getBrowserData(this.browserData)}</p>`;
          }
          if (!this.waitForUpload) {
            const room = get(options, 'rooms.budget', options.room);
            await send(options.host, room, options.accessToken, text);
          } else {
            this.budgetText = text;
          }
        }
        break;
      }
      case 'gcs.finished':
      case 'ftp.finished':
      case 's3.finished': {
        if (this.waitForUpload && options.messages.indexOf('budget') > -1) {
          const room = get(options, 'rooms.budget', options.room);
          await send(options.host, room, options.accessToken, this.budgetText);
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
