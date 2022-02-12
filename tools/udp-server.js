#!/usr/bin/env node
/*eslint no-console: 0*/

const dgram = require('dgram');

const server = dgram.createSocket('udp4');
server.on('message', function (msg) {
  console.log(msg.toString());
});

server.on('listening', function () {
  const address = server.address();
  console.log('udp server listening ' + address.address + ':' + address.port);
});

server.bind();
