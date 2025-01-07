/* eslint no-console:0 */

import { getLogger } from '@sitespeed.io/log';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { isEmpty } from '../../support/util.js';

const log = getLogger('sitespeedio.plugin.messagelogger');

function shortenData(key, value) {
  if (key === 'data' && !isEmpty(value)) {
    switch (typeof value) {
      case 'object': {
        return Array.isArray(value) ? '[...]' : '{...}';
      }
      case 'string': {
        if (value.length > 100) {
          return value.slice(0, 97) + '...';
        }
      }
    }
  }
  return value;
}

export default class MessageLoggerPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'messagelogger', options, context, queue });
  }

  open(context, options) {
    this.verbose = Number(options.verbose || 0);
  }
  processMessage(message) {
    let replacerFunction;

    switch (message.type) {
      case 'browsertime.har':
      case 'browsertime.run':
      case 'domains.summary':
      case 'browsertime.screenshot': {
        replacerFunction = this.verbose > 1 ? undefined : shortenData;
        break;
      }

      default: {
        replacerFunction = this.verbose > 0 ? undefined : shortenData;
      }
    }

    log.info(JSON.stringify(message, replacerFunction, 2));
  }
}
