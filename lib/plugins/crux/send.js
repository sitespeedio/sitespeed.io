'use strict';

const https = require('https');
const log = require('intel').getLogger('plugin.crux');

module.exports = {
  async get(url, key, formFactor, shouldWeTestTheURL) {
    let data = shouldWeTestTheURL ? { url } : { origin: url };
    if (formFactor !== 'ALL') {
      data.formFactor = formFactor;
    }
    data = JSON.stringify(data);
    // Return new promise
    return new Promise(function (resolve, reject) {
      // Do async job
      const req = https.request(
        {
          host: 'chromeuxreport.googleapis.com',
          port: 443,
          path: `/v1/records:queryRecord?key=${key}`,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data, 'utf8')
          },
          method: 'POST'
        },
        function (res) {
          if (res.statusCode >= 499) {
            log.error(
              `Got error from CrUx. Error Code: ${res.statusCode} Message: ${res.statusMessage}`
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
  }
};
