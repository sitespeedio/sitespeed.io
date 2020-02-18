'use strict';

const log = require('intel').getLogger('sitespeedio.plugin.sustainable');
const _ = require('lodash')


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


function CO2PerByte(bytes, green) {
  // return a CO2 figure for energy used to shift the corresponding
  // the data transfer.

  if (bytes < 1) {
    return 0
  }

  if (green) {
    // if we have a green datacentre, use the lower figure for renewable energy
    const Co2ForDC = bytes * KwHPerByteInDC * CO2perKwHinDCGreen;

    // but for the rest of the internet, we can't easily check, so assume
    // grey for now
    const Co2forNetwork = bytes * KwHPerByteForNetwork * Co2perKwHNetworkGrey;

    return Co2ForDC + Co2forNetwork
  }

  const KwHPerByte = KwHPerByteInDC + KwHPerByteForNetwork;
  return bytes * KwHPerByte * Co2perKwHinDCGrey
}

function perDomain(pageXray, greenDomains) {
  const entries = Object.entries(pageXray.domains)

  const CO2ByDomain = entries.map(function ([domain, val]) {
    let Co2ForTransfer;
    let green = false

    if (greenDomains && greenDomains.indexOf(domain) > -1) {
      green = true
    }

    if (green) {
      Co2ForTransfer = CO2PerByte(val.transferSize, green)
    } else {
      Co2ForTransfer = CO2PerByte(val.transferSize)
    }

    return [domain, Co2ForTransfer]
  })
  return Object.fromEntries(CO2ByDomain)
}

function sumTransferOfDomains(domainCO2) {
  function reducer(accumulator, currentValue) {
    return accumulator + currentValue;
  }
  return _.reduce(domainCO2, reducer)
}

function perPage(pageXray, green) {
  // Accept an xray object, and if we receive a boolean as the second
  // argument, we assume every request we make is sent to a server
  // running on renwewable power.

  // if we receive an array of domains, return a number accounting the
  // reduced CO2 from green hosted domains
  if (Array.isArray(green)) {
    const domainCO2 = perDomain(pageXray, green);
    return sumTransferOfDomains(domainCO2)
  }


  // The total transfer size in bytes
  const totalTransferSizeInBytes = pageXray.transferSize;

  // Note, if we have mixed green/grey resources this will overestimate emissions.
  return CO2PerByte(totalTransferSizeInBytes, green);
}

module.exports = {
  perByte: CO2PerByte,
  perDomain: perDomain,
  perPage: perPage
};
