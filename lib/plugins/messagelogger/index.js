'use strict';

/* eslint no-console:0 */

let path = require('path'),
  log = require('intel');

function shortenData(key, value) {
  if (key === 'data') {
    return '{...}';
  }
  return value;
}

module.exports = {
  name() {
    return path.basename(__filename, '.js');
  },
  open(context, options) {
    this.verbose = Number(options.verbose || 0);
  },
  processMessage(message) {
    let replacerFunc;

    switch (message.type) {
      case 'browsertime.har':
      case 'browsertime.run':
      case 'domains.summary':
      case 'gpsi.data':
      case 'webpagetest.pageSummary':
        replacerFunc = this.verbose > 1 ? null : shortenData;
        break;

      default:
        replacerFunc = this.verbose > 0 ? null : shortenData;
    }

    log.info(JSON.stringify(message, replacerFunc, 2));
  }
};
