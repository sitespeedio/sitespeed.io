'use strict';

const net = require('net'),
  log = require('intel').getLogger('sitespeedio.plugin.graphite'),
  Promise = require('bluebird');

class GraphiteSender {
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

  send(data) {
    log.debug('Send data to Graphite %s:%s', this.host, this.port);
    log.verbose('Sending ' + data);
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
