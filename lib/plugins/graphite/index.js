'use strict';

let path = require('path'),
  isEmpty = require('lodash.isempty'),
  filterRegistry = require('../../support/filterRegistry'),
  Sender = require('./sender'),
  merge = require('lodash.merge'),
  log = require('intel'),
  DataGenerator = require('./data-generator');


const defaultConfig = {
  port: 2003,
  namespace: 'sitespeed_io.default',
  includeQueryParams: false
}

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    const opts = merge({}, defaultConfig, options.graphite);
    this.sender = new Sender(opts.host, opts.port);
    this.dataGenerator = new DataGenerator(opts.namespace, opts.includeQueryParams, options);
    log.debug('Setting up Graphite %s:%s for namespace %s', opts.host, opts.port, opts.namespace);
    this.timestamp = context.timestamp;
  },
  processMessage(message) {
    if (!(message.type.endsWith('.summary') || message.type.endsWith('.pageSummary')))
      return;

    // we only sends individual groups to Grahite, not the
    // total of all groups (you can calculate that yourself)
    if (message.group === 'total')  {
      return;
    }

    message = filterRegistry.filterMessage(message);
    if (isEmpty(message.data))
      return;

    // TODO Here we could add logic to either create a new timestamp or
    // use the one that we have for that run. Now just use the one for the
    // run
    let data = this.dataGenerator.dataFromMessage(message, this.timestamp).join('\n') + '\n';

    if (data.length > 0) {
      return this.sender.send(data);
    } else {
      return Promise.reject(new Error('No data to send to graphite for message:\n' +
        JSON.stringify(message, null, 2)));
    }
  },
  config: defaultConfig
};
