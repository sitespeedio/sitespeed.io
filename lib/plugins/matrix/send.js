'use strict';

const https = require('https');
const log = require('intel').getLogger('sitespeedio.plugin.matrix');

module.exports = async (host, room, accessToken, message) => {
  const data = { msgtype: 'm.text', body: message };
  return new Promise(function(resolve, reject) {
    // Do async job
    const req = https.request(
      {
        host,
        port: 443,
        path: `_matrix/client/r0/rooms/$${room}/send/m.room.message?access_token=${accessToken}`,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data, 'utf8')
        },
        method: 'POST'
      },
      function(res) {
        if (res.statusCode >= 299) {
          log.error(
            `Got error from Matrix. Error Code: ${res.statusCode} Message: ${
              res.statusMessage
            }`
          );
          return reject(new Error(`Status Code: ${res.statusCode}`));
        }
        const data = [];
        res.on('data', chunk => {
          data.push(chunk);
        });

        res.on('end', () =>
          resolve(JSON.parse(Buffer.concat(data).toString()))
        );
      }
    );
    req.write(data);
    req.end();
  });
};
