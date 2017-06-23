'use strict';

const isEmpty = require('lodash.isempty');
const filterRegistry = require('../../support/filterRegistry');
const Sender = require('./sender');
const merge = require('lodash.merge');
const log = require('intel').getLogger('sitespeedio.plugin.elasticsearch');
const throwIfMissing = require('../../support/util').throwIfMissing;
const elasticsearchUtil = require('../../support/tsdbUtil');

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

    // Let us skip this for a while and concentrate on the real deal
    if (message.type.match(/(^largestassets|^slowestassets|^aggregateassets|^domains)/))
      return;

    // we only send individual groups to Elasticsearch, not the
    // total of all groups (you can calculate that yourself)
    if (message.group === 'total') {
      return;
    }

    message = filterRegistry.filterMessage(message);
    if (isEmpty(message.data))
      return;

    // TODO: we should add url values to all messages
    // always have browser and connectivity in Browsertime and related tools
    if (message.type.match(/(^pagexray|^coach|^browsertime|^largestassets|^slowestassets|^aggregateassets|^domains)/)) {

      // if we have a friendly name for your connectivity, use that!
      let connectivity = elasticsearchUtil.getConnectivity(this.options);

      message.connectivity = connectivity;
      message.browser = this.options.browser;
    }

    return this.sender.send(message);
  },
  config: defaultConfig
};
