'use strict';

/* eslint no-console:0 */

const log = require('intel').getLogger('sitespeedio.plugin.messagelogger');
const isEmpty = require('lodash.isempty');

function shortenData(key, value) {
  if (key === 'data' && !isEmpty(value)) {
    switch (typeof value) {
      case 'object':
        return Array.isArray(value) ? '[...]' : '{...}';
      case 'string': {
        if (value.length > 100) {
          return value.substring(0, 97) + '...';
        }
      }
    }
  }
  return value;
}

module.exports = {
  open(context, options) {
    this.verbose = Number(options.verbose || 0);
  },
  processMessage(message) {
    let replacerFunc;

    switch (message.type) {
      case 'browsertime.har':
      case 'browsertime.run':
      case 'domains.summary':
      case 'webpagetest.pageSummary':
      case 'browsertime.screenshot':
        replacerFunc = this.verbose > 1 ? null : shortenData;
        break;

      default:
        replacerFunc = this.verbose > 0 ? null : shortenData;
    }

    log.info(JSON.stringify(message, replacerFunc, 2));
  }
};
