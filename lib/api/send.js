import http from 'node:http';
import https from 'node:https';

const delay = ms => new Promise(res => setTimeout(res, ms));

export async function addTest(hostname, options, spinner) {
  const port = options.api.port ?? 3000;
  const postData = options;
  const postOptions = {
    hostname: hostname,
    port: port,
    path: '/api/add',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(postData))
    }
  };

  return new Promise((resolve, reject) => {
    // not perfect but maybe work for us
    const library = options.api.port === 443 ? https : http;
    const request = library.request(postOptions, res => {
      if (res.statusCode === 200) {
        res.setEncoding('utf8');
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => resolve(body));
      } else {
        spinner.text = `Got ${res.statusCode} from the API: ${res.statusMessage}`;
        spinner.color = 'red';
        const e = new Error(
          `Got ${res.statusCode} from the API: ${res.statusMessage}`
        );
        reject(e);
      }
    });
    request.on('error', error => {
      spinner.text = `Got ${error.toString()} from the API`;
      spinner.color = 'red';
      reject(error);
    });
    request.write(JSON.stringify(postData));
    request.end();
  });
}

export async function waitAndGetResult(testId, hostname, options, spinner) {
  do {
    await delay(2000);
    const response = await get(testId, hostname, options);
    spinner.text = response.message;
    if (response.status === 'completed') {
      return response;
    }
    // eslint-disable-next-line no-constant-condition
  } while (true);
}

export async function get(testId, hostname, options) {
  return new Promise((resolve, reject) => {
    const port = options.api.port ?? 3000;
    const library = port === 443 ? https : http;

    const url = `${port === 443 ? 'https' : 'http'}://${hostname}${
      port != 80 && port != 443 ? `:${port}` : ''
    }/api/status/${testId}`;

    library
      .get(url, res => {
        let data = [];

        if (res.statusCode != 200) {
          return reject(
            new Error(
              `Got response code ${res.statusCode} from the API: ${res.statusMessage}`
            )
          );
        }

        res.on('data', chunk => {
          data.push(chunk);
        });

        res.on('end', () => {
          return resolve(JSON.parse(Buffer.concat(data).toString()));
        });
      })
      .on('error', () => {
        return reject();
      });
  });
}
