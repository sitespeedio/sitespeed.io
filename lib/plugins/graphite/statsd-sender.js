'use strict';

const dgram = require('dgram');
const Sender = require('./sender');

class StatsDSender extends Sender {
  get facility() {
    return 'StatsD';
  }

  bulk(data) {
    this.log(data);

    return new Promise((resolve, reject) => {
      const client = dgram.createSocket('udp4');

      client.send(data, 0, data.length, this.port, this.host, error =>
        client.close() && error ? reject(error) : resolve()
      );
    });
  }
}

module.exports = StatsDSender;
