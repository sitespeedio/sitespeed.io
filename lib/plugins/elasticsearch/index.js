const path = require('path');
const Sender = require('./sender');
const filterRegistry = require('../../support/filterRegistry');
const isEmpty = require('lodash.isempty');
const log = require('intel');
const throwIfMissing = require('../../support/util').throwIfMissing;
const dataGenerator = require('./datagenerator');

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    throwIfMissing(options.elasticsearch, ['host', 'port'], 'elasticsearch');

    const opts = options.elasticsearch || {};
    this.sender = new Sender(opts.host, opts.port, context.timestamp);
  },
  processMessage(message) {
    if (!(message.type.endsWith('.summary') || message.type.endsWith('.pageSummary')))
      return;

    // we only sends individual groups to Elastic
    // NOTE: this is ported straight from the Graphite plugin
    if (message.group === 'total')  {
      return;
    }

    const filteredMessage = filterRegistry.filterMessage(message);

    if (isEmpty(filteredMessage.data)) {
      log.info(`Removed ${filteredMessage.type} since data is empty after filtering.`);
      return;
    }

    return dataGenerator(filteredMessage.type)(this.sender, this.timestamp, filteredMessage);
  }
};

