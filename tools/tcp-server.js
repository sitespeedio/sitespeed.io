#!/usr/bin/env node
/*eslint no-console: 0*/

import { createServer } from 'node:net';

const server = createServer(function (sock) {
  sock.on('data', function (data) {
    console.log(data.toString());
  });
}).listen(process.argv[2] || 0, undefined, undefined, () => {
  const address = server.address();
  console.log('Server listening on ' + address.address + ':' + address.port);
});
