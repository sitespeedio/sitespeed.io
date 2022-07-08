'use strict';

const throwIfMissing = require('../../support/util').throwIfMissing;
const log = require('intel').getLogger('sitespeedio.plugin.matrix');
const path = require('path');
const get = require('lodash.get');
const cliUtil = require('../../cli/util');
const send = require('./send');

function getBrowserData(data) {
  if (data && data.browser) {
    return `${data.browser.name} ${data.browser.version} ${get(
      data,
      'android.model',
      ''
    )} ${get(data, 'android.androidVersion', '')} ${get(
      data,
      'android.id',
      ''
    )} `;
  } else return '';
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
    this.alias = {};
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
      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }

      case 'sitespeedio.render': {
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
      case 'browsertime.config': {
        if (message.data.screenshot === true) {
          this.screenshotType = message.data.screenshotType;
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
            text += `<h1>&#9888;&#65039; Budget failing (${failingURLs.length} URLs)</h1>`;
            text += `<p><b>${
              get(this.options, 'name', '') + '</b> '
            }${getBrowserData(this.browserData)}</p>`;
            for (let url of failingURLs) {
              text += `<h5>&#10060; ${url}`;
              if (this.resultUrls.hasBaseUrl()) {
                text += ` (<a href="${this.resultUrls.absoluteSummaryPagePath(
                  url,
                  this.alias[url]
                )}index.html">result</a> - <a href="${this.resultUrls.absoluteSummaryPagePath(
                  url,
                  this.alias[url]
                )}data/screenshots/1/afterPageCompleteCheck.${
                  this.screenshotType
                }">screenshot</a>)</h5>`;
              } else {
                text += '</h5>';
              }
              text += '<ul>';
              for (let failing of message.data.failing[url]) {
                text += `<li>${failing.metric} : ${failing.friendlyValue} (${failing.friendlyLimit})</li>`;
              }
              text += `</ul>`;
            }
          }
          if (Object.keys(message.data.error).length > 0) {
            const errorURLs = Object.keys(message.data.error);
            text += `<h1>&#9888;&#65039; Budget errors testing ${errorURLs.length} URLs</h1>`;
            for (let url of errorURLs) {
              text += `<h5>&#10060; ${url}</h5>`;
              text += `<pre>${message.data.error[url]}</pre>`;
            }
          }
          if (
            Object.keys(message.data.error).length === 0 &&
            Object.keys(message.data.failing).length === 0
          ) {
            text += `<p><b>&#127881; All (${
              Object.keys(message.data.working).length
            }) URLs passed the budget. </b></p>`;
            text += `<p><b>${
              get(this.options, 'name', '') + '</b> '
            }${getBrowserData(this.browserData)}</p>`;
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
      case 'scp.finished':
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
