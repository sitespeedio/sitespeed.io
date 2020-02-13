'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.sustainable');
const https = require('https');

async function getBody(url) {
  // Return new promise
  return new Promise(function(resolve, reject) {
    // Do async job
    const req = https.get(url, function(res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        log.error(
          'Could not get infor from the Green Web Foundation API, %s',
          res.statusCode
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

module.exports = {
  async isGreen(pageXray) {
    const domains = Object.keys(pageXray.domains);

    try {
      const allGreenCheckResults = JSON.parse(
        await getBody(
          `https://api.thegreenwebfoundation.org/v2/greencheckmulti/${JSON.stringify(
            domains
          )}`
        )
      );

      return [allGreenCheckResults[pageXray.baseDomain], allGreenCheckResults];
    } catch (e) {
      return {};
    }
  }
};
