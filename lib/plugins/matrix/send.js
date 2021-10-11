'use strict';

const https = require('https');
const log = require('intel').getLogger('sitespeedio.plugin.matrix');

function send(
  host,
  data,
  message,
  room,
  accessToken,
  retries = 3,
  backoff = 5000
) {
  const retryCodes = [408, 429, 500, 503];
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host,
        port: 443,
        path: `/_matrix/client/r0/rooms/${room}/send/m.room.message?access_token=${accessToken}`,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(data), 'utf8')
        },
        method: 'POST'
      },
      res => {
        const { statusCode } = res;
        if (statusCode < 200 || statusCode > 299) {
          if (retries > 0 && retryCodes.includes(statusCode)) {
            setTimeout(() => {
              return send(
                host,
                data,
                message,
                room,
                accessToken,
                retries - 1,
                backoff * 2
              );
            }, backoff);
          } else {
            log.error(
              `Got error from Matrix. Error Code: ${res.statusCode} Message: ${res.statusMessage}`
            );
            reject(new Error(`Status Code: ${res.statusCode}`));
          }
        } else {
          const data = [];
          res.on('data', chunk => {
            data.push(chunk);
          });
          res.on('end', () => {
            resolve(JSON.parse(Buffer.concat(data).toString()));
          });
        }
      }
    );
    req.write(JSON.stringify(data));
    req.end();
  });
}

module.exports = async (host, room, accessToken, message) => {
  const data = {
    msgtype: 'm.notice',
    body: '',
    format: 'org.matrix.custom.html',
    formatted_body: message
  };
  return send(host, data, message, room, accessToken);
};
