'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.sustainable');

// Use the 1byte model for now from the Shift Project, and assume a US grid mix of around 519 g co2 for the time being.
const Co2perKwHinDCGrey = 519;
const CO2perKwHinDCGreen = 33;
// the better way would be do to this with a weighted average of types of RE generation
// from solar, to wind, to biomass, and hydro and so on, based on how much they
// are used.
// For now, let's use a quoted figure from Ecotricity, which quotes OFGEM, the UK regulator
// and it's better than most quoted figures which pretend there is *no* footprint
// for RE.
// More here:
// https://www.ecotricity.co.uk/layout/set/popup/layout/set/print/for-your-home/britain-s-greenest-energy-company/lifecycle-carbon-emissions
// https://twitter.com/mrchrisadams/status/1227972969756086284
// https://en.wikipedia.org/wiki/Life-cycle_greenhouse-gas_emissions_of_energy_sources

// 33.4, but that's for the UK in 2014/15. Shouldn't be too off though. Probably lower now.

const Co2perKwHNetworkGrey = 495;

// these are the figures pulled from the 1byte model, there is a
// third figure to represent carbon emission from *making* the device used to access a site/app but we lieave it out as it relies on
// us knowing how long it's being used to read content
const KwHPerByteInDC = 0.00000000072;
const KwHPerByteForNetwork = 0.00000000152;


function CO2PerByte(bytes) {
  // this our final figure for grams of CO2
  // assume we have normal, 'grey' power
  const KwHPerByte = KwHPerByteInDC + KwHPerByteForNetwork;

  return bytes * KwHPerByte * Co2perKwHinDCGrey;
}

function CO2PerByteGreen(bytes) {
  // if we have a green datacentre, use the lower figure for 'platform'
  const Co2ForDC = bytes * KwHPerByteInDC * CO2perKwHinDCGreen;

  // but for the rest of the internet, we can't easily check, so assume
  // grey, even in cases like France which has a grid full of nukes
  const Co2forNetwork = bytes * KwHPerByteForNetwork * Co2perKwHNetworkGrey;

  return Co2ForDC + Co2forNetwork
}

function domainAndTransfer(domainEntry) {
  return {
    domain: domainEntry[0],
    transferSize: domainEntry[1].transferSize,
    transferCO2: CO2PerByte(domainEntry[1].transferSize)
  };
}

function adjustForGreenInfra(domainsWithTransfer, greenchecks) {

  const adjustedDomains = domainsWithTransfer.map(function (dom) {
    // this feels brittle
    if (greenchecks[dom.domain].green) {
      dom["adjustedTransferCO2"] = CO2PerByteGreen(dom.transferSize)
    }
    return dom
  })


}

module.exports = {
  perPage(pageXray) {
    // The total transfer size in bytes
    const totalTransferSizeInBytes = pageXray.transferSize;

    // Note, if we have mixed green/grey resources this will overestimate emissions.
    return CO2PerByte(totalTransferSizeInBytes);
  },

  perDomain(pageXray, greencheckResults) {
    const transferByDomain = Object.entries(pageXray.domains).map(
      domainAndTransfer
    );

    // for each green domain, use the greener value for the DC
    if (greencheckResults.length) {
      const allGreenChecks = greencheckResults[1]
      const adjustedTransferByDomain = adjustForGreenInfra(transferByDomain, allGreenChecks)
      return adjustedTransferByDomain

    }

    return transferByDomain
  }
};
