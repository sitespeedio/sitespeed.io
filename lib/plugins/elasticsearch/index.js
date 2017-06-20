'use strict';

const isEmpty = require('lodash.isempty');
const filterRegistry = require('../../support/filterRegistry');
const Sender = require('./sender');
const merge = require('lodash.merge');
const log = require('intel').getLogger('sitespeedio.plugin.elasticsearch');
const throwIfMissing = require('../../support/util').throwIfMissing;

const defaultConfig = {
  host: 'localhost',
  port: 9200
};

module.exports = {
  open(context, options) {
    throwIfMissing(options.elasticsearch, ['host', 'port'], 'elasticsearch');
    const opts = merge({}, defaultConfig, options.elasticsearch);
    this.options = options;
    this.sender = new Sender(opts.host, opts.port, context.timestamp);
    log.debug('Setting up Elasticsearch %s:%s for namespace %s', opts.host, opts.port, opts.namespace);
    this.timestamp = context.timestamp;
    this.resultUrls = context.resultUrls;
  },
  processMessage(message) {
    if (!(message.type.endsWith('.summary') || message.type.endsWith('.pageSummary')))
      return;

    // we only send individual groups to Elasticsearch, not the
    // total of all groups (you can calculate that yourself)
    if (message.group === 'total') {
      return;
    }

    message = filterRegistry.filterMessage(message);
    if (isEmpty(message.data))
      return;

    return this.sender.send(message);
  },
  config: defaultConfig
};
