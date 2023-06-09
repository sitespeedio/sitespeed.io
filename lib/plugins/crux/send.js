import { request as _request } from 'node:https';
import * as http from 'node:http';
import * as https from 'node:https';

import intel from 'intel';
const log = intel.getLogger('plugin.crux');

//use proxy?
let proxy = false;
if(process.env.http_proxy) {
    proxy = new URL(process.env.http_proxy);
}

if(process.env.https_proxy) {
    proxy = new URL(process.env.https_proxy);
}

//chromeuxreport target config
const cruxtHost = 'chromeuxreport.googleapis.com';
const cruxPort = 443;
const cruxHTTPMethod = 'POST';


export async function send(url, key, formFactor, shouldWeTestTheURL) {
  let data = shouldWeTestTheURL ? { url } : { origin: url };
  if (formFactor !== 'ALL') {
    data.formFactor = formFactor;
  }
  data = JSON.stringify(data);

  const cruxPath = `/v1/records:queryRecord?key=${key}`;
  const cruxHeaders = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data, 'utf8')
  };

  //no proxy
  if(proxy === false) {
    // Return new promise
    return new Promise(function (resolve, reject) {
      // Do async job
      const request = _request(
        {
          host: cruxtHost,
          port: cruxPort,
          path: cruxPath,
          headers: cruxHeaders,
          method: cruxHTTPMethod
        },
        (res) => {
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
      request.write(data);
      request.end();
    });
  //use proxy
  } else {
    return proxyRequest(`https://${cruxtHost}${cruxPath}`, cruxHeaders, data);
  }
}




//do request with proxy
async function proxyRequest(url, headers, body) {
    return new Promise((resolve, reject) => {
        const urlParsed = new URL(url);
        http.request({
            host: proxy.hostname,
            port: proxy.port,
            method: 'CONNECT',
            path: `${urlParsed.hostname}:${cruxPort}`,
            headers
        }).on('connect', (res, socket) => {
            // To avoid leaking the header since it could enable someone to detect you!
            delete headers['Proxy-Authorization']
            if (res.statusCode === 200) {
                const agent = new https.Agent({ socket });

                const req = https.request(
                    {
                        host: urlParsed.hostname,
                        path: urlParsed.pathname + urlParsed.search,
                        agent,
                        headers: headers,
                        method: cruxHTTPMethod
                    },
                    (res) => {
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
                            resolve(JSON.parse(Buffer.concat(data).toString()));
                        });
                    }
                );
                req.write(body);
                req.end();

                req.on('error', (err) => {
                    reject(err.message);
                })
            } else {
                reject('Could not connect to proxy!')
            }

        }).on('error', (err) => {
            reject(err.message);
        }).end();
    })
}
