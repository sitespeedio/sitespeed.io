#!/usr/bin/env node
/*eslint no-console: 0*/

import { createSocket } from 'node:dgram';

const server = createSocket('udp4');
server.on('message', function (message) {
  console.log(message.toString());
});

server.on('listening', function () {
  const address = server.address();
  console.log('udp server listening ' + address.address + ':' + address.port);
});

server.bind();
