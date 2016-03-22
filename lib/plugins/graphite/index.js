'use strict';

let path = require('path'),
  throwIfMissing = require('../../support/util').throwIfMissing,
  filterRegistry = require('../../support/filterRegistry'),
  Sender = require('./sender'),
  DataGenerator = require('./data-generator');

function isEmpty(o) {
  if (o === null || o === undefined)
    return true;

  if (typeof o === 'object')
    return Object.keys(o).length === 0;

  if (typeof o === 'string')
    return o.length === 0;

  return false;
}

module.exports = {
  name() { return path.basename(__dirname); },
  open(context, options) {
    throwIfMissing(options.graphite, ['host', 'port', 'namespace'], 'graphite');

    const opts = options.graphite || {};
    this.sender = new Sender(opts.host, opts.port);
    this.dataGenerator = new DataGenerator(opts.namespace, opts.includeQueryParams);
  },
  processMessage(message) {
    switch (message.type) {
      case 'browsertime.pageSummary':
      case 'webpagetest.pageSummary':
      case 'gpsi.pageSummary':
      case 'domains.summary':
      case 'coach.summary':
      {
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
    }
  }
};
