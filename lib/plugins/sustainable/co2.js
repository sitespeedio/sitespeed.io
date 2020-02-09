'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.sustainable');

module.exports = {
  perPage(pageXray) {
    // The total transfer size in bytes
    const totalTransferSizeInBytes = pageXray.transferSize;
    // Lets do all the magical calculations here
    log.info('Total transfser size %s', totalTransferSizeInBytes);
    return 1;
  }
};
