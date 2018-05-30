'use strict';

const net = require('net'),
  Promise = require('bluebird'),
  Sender = require('./sender');

class GraphiteSender extends Sender {
  get facility() {
    return 'Graphite';
  }

  bulk(data) {
    this.log(data);

    return new Promise((resolve, reject) => {
      const socket = net.connect(
        this.port,
        this.host,
        () => {
          socket.write(data);
          socket.end();
          resolve();
        }
      );
      socket.on('error', reject);
    });
  }
}

module.exports = GraphiteSender;
