'use strict';

const throwIfMissing = require('../../support/util').throwIfMissing;
const log = require('intel').getLogger('sitespeedio.plugin.webhook');
const path = require('path');
const get = require('lodash.get');
const cliUtil = require('../../cli/util');
const send = require('./send');
const Format = require('./format');

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
    this.webHookOptions = options.webhook || {};
    this.options = options;
    log.info('Starting the webhook plugin');
    throwIfMissing(options.webhook, ['url'], 'webhook');
    this.format = new Format(this.webHookOptions.style);
    this.resultUrls = context.resultUrls;
    this.waitForUpload = false;
    this.alias = {};
    this.data = {};
    this.errorTexts = {};
    this.message = { text: '' };
    if (options.webhook) {
      for (let key of Object.keys(options.webhook)) {
        if (key !== 'url' && key !== 'messages' && key !== 'style') {
          this.message[key] = options.webhook[key];
        }
      }
    }
  },
  async processMessage(message) {
    const options = this.webHookOptions;
    const format = this.format;
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
      case 'browsertime.config': {
        if (message.data.screenshot === true) {
          this.screenshotType = message.data.screenshotType;
        }
        break;
      }
      case 'browsertime.pageSummary': {
        if (this.waitForUpload && options.messages.indexOf('pageSumary') > -1) {
          this.data[message.url] = message.data;
        } else if (options.messages.indexOf('pageSumary') > -1) {
          await send(options.url, {
            text: `Test finished ${format.link(message.data.info.url)}`
          });
        }
        break;
      }

      case 'error': {
        // We can send too many messages to Matrix and get 429 so instead
        // we bulk send them all one time
        if (options.messages.indexOf('error') > -1) {
          this.errorTexts += `${format.hr()} &#9888;&#65039; Error from ${format.bold(
            message.source
          )} testing ${
            message.url ? format.link(message.url) : ''
          }  ${format.pre(message.data)}`;
        }
        break;
      }

      case 'budget.result': {
        if (options.messages.indexOf('budget') > -1) {
          let text = '';
          //  We have failing URLs in the budget
          if (Object.keys(message.data.failing).length > 0) {
            const failingURLs = Object.keys(message.data.failing);
            text += `${format.heading(
              '&#9888;&#65039; Budget failing (' + failingURLs.length + ' URLs)'
            )}`;
            text += `${format.p(
              get(this.options, 'name', '') +
                ' ' +
                getBrowserData(this.browserData)
            )}`;
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
                text += `<li>${failing.metric} : ${failing.friendlyValue} (${
                  failing.friendlyLimit
                })</li>`;
              }
              text += `</ul>`;
            }
          }
          if (Object.keys(message.data.error).length > 0) {
            const errorURLs = Object.keys(message.data.error);
            text += `<h1>&#9888;&#65039; Budget errors testing ${
              errorURLs.length
            } URLs</h1>`;
            for (let url of errorURLs) {
              text += `<h5>&#10060; ${url}</h5>`;
              text += `<pre>${message.data.error[url]}</pre>`;
            }
          }
          if (
            Object.keys(message.data.error).length === 0 &&
            Object.keys(message.data.failing).length === 0
          ) {
            text += format.p(
              `&#127881; All (${
                Object.keys(message.data.working).length
              }) URL(s) passed the budget using ${get(
                this.options,
                'name',
                ''
              )} ${getBrowserData(this.browserData)}`
            );
          }
          if (!this.waitForUpload) {
            await send(options.url, { text });
          } else {
            this.budgetText = text;
          }
        }
        break;
      }

      case 'gcs.finished':
      case 'ftp.finished':
      case 's3.finished': {
        if (this.waitForUpload && options.messages.indexOf('summary') > -1) {
          const message = {
            text: format.link(
              this.resultUrls.reportSummaryUrl() + '/index.html'
            )
          };
          await send(options.url, message);
        } else if (
          this.waitForUpload &&
          options.messages.indexOf('budget') > -1
        ) {
          await send(options.url, { text: this.budgetText });
        }

        break;
      }

      case 'sitespeedio.render': {
        if (this.errorTexts !== '') {
          await send(options.url, { message: this.errorTexts });
        }
        break;
      }
    }
  },
  get config() {
    return cliUtil.pluginDefaults(this.cliOptions);
  }
};
