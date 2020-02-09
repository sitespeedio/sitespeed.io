'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.sustainable');

module.exports = {
  isGreen(pageXray) {
    // The base domain for a URL
    const baseDomain = pageXray.baseDomain;
    // All domains for that page exists in pageXray.domains (including the base domain)
    const domains = Object.keys(pageXray.domains);
    // And there you also have the transfer size per domain

    // One cool thing we could do if we have Green Web Foundation data is that we test
    // all domains instead of the main domain, so that we can see how many of the domains
    // used for a site is green
    log.info('Tested base domain %s', baseDomain);
    log.info('With the following domains %s', domains);
  }
};
