'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.sustainable');
const https = require('https');

async function getBody(url) {
  // Return new promise
  return new Promise(function (resolve, reject) {
    // Do async job
    const req = https.get(url, function (res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        log.error(
          'Could not get info from the Green Web Foundation API, %s for %s',
          res.statusCode,
          url
        );
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }
      const data = [];

      res.on('data', chunk => {
        data.push(chunk);
      });

      res.on('end', () => resolve(Buffer.concat(data).toString()));
    });
    req.end();
  });
}
async function greenDomains(pageXray) {
  const domains = Object.keys(pageXray.domains);

  try {
    const allGreenCheckResults = JSON.parse(
      await getBody(
        `https://api.thegreenwebfoundation.org/v2/greencheckmulti/${JSON.stringify(
          domains
        )}`
      )
    );

    const entries = Object.entries(allGreenCheckResults);
    // TODO find the preferred way for assigning vars
    // when making key value pairs , but only using the val

    /* eslint-disable-next-line */
    let greenEntries = entries.filter(function ([key, val]) {
      return val.green;
    });
    /* eslint-disable-next-line */
    return greenEntries.map(function ([key, val]) {
      return val.url;
    });
  } catch (e) {
    return [];
  }
}

module.exports = {
  greenDomains
};
