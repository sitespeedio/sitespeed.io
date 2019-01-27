'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.graphite');

class Sender {
  constructor(host, port, bulkSize) {
    this.host = host;
    this.port = port;
    this.bulkSize = bulkSize;
  }

  get facility() {
    return 'None';
  }

  log(data) {
    log.debug('Send data to %s %s:%s', this.facility, this.host, this.port);
    log.verbose(`Sending ${data}`);
  }

  send(data) {
    return this[this.bulkSize ? 'bulks' : 'bulk'](data);
  }

  bulk() {
    throw new ReferenceError('bulk function not implemented');
  }

  bulks(data) {
    const lines = data.split('\n');
    const promises = [];
    const bulkSize = this.bulkSize || lines.length;

    while (lines.length) {
      promises.push(this.bulk(lines.splice(-bulkSize).join('\n')));
    }

    return Promise.all(promises);
  }
}

module.exports = Sender;
