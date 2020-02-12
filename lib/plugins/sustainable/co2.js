'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.sustainable');


module.exports = {
  perPage(pageXray) {
    // The total transfer size in bytes
    const totalTransferSizeInBytes = pageXray.transferSize

    log.info('Total transfer size %s', totalTransferSizeInBytes);

    // Use the 1byte model for now from the Shift Project, and assume a US grid mix of around 519 g co2 for the time being.
    const Co2perKwH = 519

    // Just add the figures for transfer, we don't track device usage time til we know how.
    const KwHPerByteInDC = 0.00000000072
    const KwHPerByteForNetwork = 0.00000000152

    const KwHPerByte = KwHPerByteInDC + KwHPerByteForNetwork

    const totalCO2PerPageLoad = totalTransferSizeInBytes * KwHPerByte * Co2perKwH

    return totalCO2PerPageLoad;
  }
};
