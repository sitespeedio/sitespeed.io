'use strict';

const https = require('https');
const http = require('http');
const log = require('intel').getLogger('sitespeedio.plugin.webhook');

function send(url, message, retries = 3, backoff = 5000) {
  const parsedUrl = new URL(url);
  const send = parsedUrl.protocol === 'https' ? https : http;

  const retryCodes = [408, 429, 500, 503];
  return new Promise((resolve, reject) => {
    const req = send.request(
      {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(message), 'utf8')
        },
        method: 'POST'
      },
      res => {
        const { statusCode } = res;
        if (statusCode < 200 || statusCode > 299) {
          if (retries > 0 && retryCodes.includes(statusCode)) {
            setTimeout(() => {
              return send(url, message, retries - 1, backoff * 2);
            }, backoff);
          } else {
            log.error(
              `Got error from the webhook server. Error Code: ${
                res.statusCode
              } Message: ${res.statusMessage}`
            );
            reject(new Error(`Status Code: ${res.statusCode}`));
          }
        } else {
          const data = [];
          res.on('data', chunk => {
            data.push(chunk);
          });
          res.on('end', () => {
            resolve(Buffer.concat(data).toString());
          });
        }
      }
    );
    req.write(JSON.stringify(message));
    req.end();
  });
}

module.exports = async (url, message) => {
  return send(url, message);
};
