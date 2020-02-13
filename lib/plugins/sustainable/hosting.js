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
    // The base domain for a URL
    const baseDomain = pageXray.baseDomain;
    try {
      return JSON.parse(
        await getBody(
          `https://api.thegreenwebfoundation.org/greencheck/${baseDomain}`
        )
      );
    } catch (e) {
      return {};
    }
    // All domains for that page exists in pageXray.domains (including the base domain)
    // const domains = Object.keys(pageXray.domains);
    // And there you also have the transfer size per domain

    // One cool thing we could do if we have Green Web Foundation data is that we test
    // all domains instead of the main domain, so that we can see how many of the domains
    // used for a site is green
  }
};
