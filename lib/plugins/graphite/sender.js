'use strict';

var net = require('net'),
  log = require('intel'),
  Promise = require('bluebird');

class GraphiteSender {
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

  send(data) {
    log.info('Send data to Graphite ' + this.host);
    log.trace('Sending ' + data);
    return new Promise((resolve, reject) => {
      let socket = net.connect(this.port, this.host, () => {
        socket.write(data);
        socket.end();
        resolve();
      });
      socket.on('error', reject);
    });
  }
}

module.exports = GraphiteSender;
