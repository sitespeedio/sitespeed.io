'use strict';

let path = require('path'),
  throwIfMissing = require('../../support/util').throwIfMissing,
  isEmpty = require('../../support/util').isEmpty,
  filterRegistry = require('../../support/filterRegistry'),
  Sender = require('./sender'),
  DataGenerator = require('./data-generator');

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    throwIfMissing(options.graphite, ['host', 'port', 'namespace'], 'graphite');

    const opts = options.graphite || {};
    this.sender = new Sender(opts.host, opts.port);
    this.dataGenerator = new DataGenerator(opts.namespace, opts.includeQueryParams);
  },
  processMessage(message) {
    if (!(message.type.endsWith('.summary') || message.type.endsWith('.pageSummary')))
      return;

    message = filterRegistry.filterMessage(message);
    if (isEmpty(message.data))
      return;

    let data = this.dataGenerator.dataFromMessage(message);

    if (data.length > 0) {
      return this.sender.send(data);
    } else {
      return Promise.reject(new Error('No data to send to graphite for message:\n' +
        JSON.stringify(message, null, 2)));
    }
  }
};
