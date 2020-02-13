'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.sustainable');

// Use the 1byte model for now from the Shift Project, and assume a US grid mix of around 519 g co2 for the time being.
const Co2perKwH = 519;

// these are the figures pulled from the 1byte model, there is a
// third figure to represent carbon emission from *making* the device used to access a site/app but we lieave it out as it relies on
// us knowing how long it's being used to read content
const KwHPerByteInDC = 0.00000000072;
const KwHPerByteForNetwork = 0.00000000152;
const KwHPerByte = KwHPerByteInDC + KwHPerByteForNetwork;


function CO2PerByte(bytes) {
  // this our final figure for grams of CO2

  // we might convert based on size with some SI conversion library
  return bytes * KwHPerByte * Co2perKwH
}

function domainAndTransfer(domainEntry) {
  return {
    domain: domainEntry[0],
    transferSize: domainEntry[1].transferSize,
    transferCO2: CO2PerByte(domainEntry[1].transferSize)
  };
}

module.exports = {
  perPage(pageXray) {
    // The total transfer size in bytes
    const totalTransferSizeInBytes = pageXray.transferSize;

    const transferByDomain = Object.entries(pageXray.domains).map(
      domainAndTransfer
    );

    return [CO2PerByte(totalTransferSizeInBytes), transferByDomain];
  }
};
