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
  port: 9200,
  includeQueryParams: false,
  fieldsLimit: 1900
};

module.exports = {
  open(context, options) {
    throwIfMissing(options.elasticsearch, ['host', 'port'], 'elasticsearch');
    const opts = merge({}, defaultConfig, options.elasticsearch);
    this.includeQueryParams = opts.includeQueryParams;
    this.options = options;
    let increaseFieldLimit = false;
    if (options.metrics.filter == '*+') {
      increaseFieldLimit = true;
    }

    this.sender = new Sender(opts.host, opts.port, context.timestamp, increaseFieldLimit, opts.fieldsLimit);
    log.debug('Setting up Elasticsearch %s:%s for namespace %s', opts.host, opts.port, opts.namespace);
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

    // always have browser and connectivity in Browsertime and related tools
    if (message.type.match(/(^pagexray|^coach|^browsertime)/)) {

      // if we have a friendly name for your connectivity, use that!
      let connectivity = elasticsearchUtil.getConnectivity(this.options);

      message.connectivity = connectivity;
      message.browser = this.options.browser;
    }

    // URL might be too long with query params,
    // so create friendly alias
    if (message.url) {
      let alias = elasticsearchUtil.getURLAndGroup(this.options, message.group, message.url, this.includeQueryParams);
      message.alias = alias;
    }

    return this.sender.send(message);
  },
  config: defaultConfig
};
