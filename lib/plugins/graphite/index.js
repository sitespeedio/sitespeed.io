'use strict';

const isEmpty = require('lodash.isempty');
const filterRegistry = require('../../support/filterRegistry');
const Sender = require('./sender');
const merge = require('lodash.merge');
const log = require('intel').getLogger('sitespeedio.plugin.graphite');
const sendAnnotations = require('./send-annotation');
const DataGenerator = require('./data-generator');
const throwIfMissing = require('../../support/util').throwIfMissing;

const defaultConfig = {
  port: 2003,
  namespace: 'sitespeed_io.default',
  includeQueryParams: false
};

module.exports = {
  open(context, options) {
    throwIfMissing(options.graphite, ['host'], 'graphite');
    const opts = merge({}, defaultConfig, options.graphite);
    this.options = options;
    this.sender = new Sender(opts.host, opts.port);
    this.dataGenerator = new DataGenerator(opts.namespace, opts.includeQueryParams, options);
    log.debug('Setting up Graphite %s:%s for namespace %s', opts.host, opts.port, opts.namespace);
    this.timestamp = context.timestamp;
    this.resultUrls = context.resultUrls;
  },
  processMessage(message) {
    if (!(message.type.endsWith('.summary') || message.type.endsWith('.pageSummary')))
      return;

    // we only sends individual groups to Graphite, not the
    // total of all groups (you can calculate that yourself)
    if (message.group === 'total') {
      return;
    }

    message = filterRegistry.filterMessage(message);
    if (isEmpty(message.data))
      return;

    // TODO Here we could add logic to either create a new timestamp or
    // use the one that we have for that run. Now just use the one for the
    // run
    const dataPoints = this.dataGenerator.dataFromMessage(message, this.timestamp);

    if (dataPoints.length > 0) {
      const data = dataPoints.join('\n') + '\n';
      return this.sender.send(data).then(() => {
        // make sure we only send once per URL (and browsertime is the most important)
        // and you need to configure a base URL where you get the HTML result
        if (message.type === 'browsertime.pageSummary' && this.resultUrls.hasBaseUrl()) {
          const resultPageUrl = this.resultUrls.absoluteSummaryPageUrl(message.url);
          return sendAnnotations.send(this.options, message.group, message.url, resultPageUrl, this.timestamp);
        }
      });
    } else {
      return Promise.reject(new Error('No data to send to graphite for message:\n' +
        JSON.stringify(message, null, 2)));
    }
  },
  config: defaultConfig
};
