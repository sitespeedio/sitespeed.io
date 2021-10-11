#!/usr/bin/env node
/*eslint no-console: 0*/

const net = require('net');

const server = net
  .createServer(function (sock) {
    sock.on('data', function (data) {
      console.log(data.toString());
    });
  })
  .listen(process.argv[2] || 0, undefined, undefined, () => {
    const address = server.address();
    console.log('Server listening on ' + address.address + ':' + address.port);
  });
