#!/usr/bin/env node
/*eslint no-console: 0*/

var net = require('net');

var server = net
  .createServer(function(sock) {
    sock.on('data', function(data) {
      console.log(data.toString());
    });
  })
  .listen(process.argv[2] || 0, undefined, undefined, () => {
    var address = server.address();
    console.log('Server listening on ' + address.address + ':' + address.port);
  });
