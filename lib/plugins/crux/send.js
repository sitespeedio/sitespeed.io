import { request as _request } from 'node:https';
import { getLogger } from '@sitespeed.io/log';
const log = getLogger('plugin.crux');

export async function send(url, key, formFactor, shouldWeTestTheURL) {
  let data = shouldWeTestTheURL ? { url } : { origin: url };
  if (formFactor !== 'ALL') {
    data.formFactor = formFactor;
  }
  data = JSON.stringify(data);
  // Return new promise
  return new Promise(function (resolve, reject) {
    // Do async job
    const request = _request(
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

        res.on('end', () => {
          const body = Buffer.concat(data).toString();
          try {
            resolve(JSON.parse(body));
          } catch {
            // An exception here is not caught by anyone and stops sitespeed.io
            reject(
              new Error(
                `Could not parse the CrUx response (${res.statusCode}): ${body}`
              )
            );
          }
        });
      }
    );
    request.on('error', reject);
    request.write(data);
    request.end();
  });
}
