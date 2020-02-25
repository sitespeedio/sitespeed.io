'use strict';

const url = require('url');
// const log = require('intel').getLogger('sitespeedio.plugin.sustainable');

// Use the 1byte model for now from the Shift Project, and assume a US grid mix of around 519 g co2 for the time being.
const CO2_PER_KWH_IN_DC_GREY = 519;
const CO2_PER_KWH_IN_DC_GREEN = 33;

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

const CO2_PER_KWH_NETWORK_GREY = 495;

// these are the figures pulled from the 1byte model, there is a
// third figure to represent carbon emission from *making* the device used to access a site/app but we lieave it out as it relies on
// us knowing how long it's being used to read content
const KWH_PER_BYTE_IN_DC = 0.00000000072;
const KWH_PER_BYTE_FOR_NETWORK = 0.00000000152;

function getCO2PerByte(bytes, green) {
  // return a CO2 figure for energy used to shift the corresponding
  // the data transfer.

  if (bytes < 1) {
    return 0;
  }

  if (green) {
    // if we have a green datacentre, use the lower figure for renewable energy
    const Co2ForDC = bytes * KWH_PER_BYTE_IN_DC * CO2_PER_KWH_IN_DC_GREEN;

    // but for the rest of the internet, we can't easily check, so assume
    // grey for now
    const Co2forNetwork =
      bytes * KWH_PER_BYTE_FOR_NETWORK * CO2_PER_KWH_NETWORK_GREY;

    return Co2ForDC + Co2forNetwork;
  }

  const KwHPerByte = KWH_PER_BYTE_IN_DC + KWH_PER_BYTE_FOR_NETWORK;
  return bytes * KwHPerByte * CO2_PER_KWH_IN_DC_GREY;
}

function getCO2PerDomain(pageXray, greenDomains) {
  const co2PerDomain = [];
  for (let domain of Object.keys(pageXray.domains)) {
    let co2;
    if (greenDomains && greenDomains.indexOf(domain) > -1) {
      co2 = getCO2PerByte(pageXray.domains[domain].transferSize, true);
    } else {
      co2 = getCO2PerByte(pageXray.domains[domain].transferSize);
    }
    co2PerDomain.push({
      domain,
      co2,
      transferSize: pageXray.domains[domain].transferSize
    });
  }
  co2PerDomain.sort(function(a, b) {
    return b.co2 - a.co2;
  });

  return co2PerDomain;
}

function getCO2perPage(pageXray, green) {
  // Accept an xray object, and if we receive a boolean as the second
  // argument, we assume every request we make is sent to a server
  // running on renwewable power.

  // if we receive an array of domains, return a number accounting the
  // reduced CO2 from green hosted domains

  const domainCO2 = getCO2PerDomain(pageXray, green);
  let totalCO2 = 0;
  for (let domain of domainCO2) {
    totalCO2 += domain.co2;
  }
  return totalCO2;
}

function getCO2PerContentType(pageXray, greenDomains) {
  const co2PerContentType = {};
  for (let asset of pageXray.assets) {
    const domain = url.parse(asset.url).domain;
    const transferSize = asset.transferSize;
    const co2ForTransfer = getCO2PerByte(
      transferSize,
      greenDomains && greenDomains.indexOf(domain) > -1
    );
    const contentType = asset.type;
    if (!co2PerContentType[contentType]) {
      co2PerContentType[contentType] = { co2: 0, transferSize: 0 };
    }
    co2PerContentType[contentType].co2 += co2ForTransfer;
    co2PerContentType[contentType].transferSize += transferSize;
  }
  // restructure and sort
  const all = [];
  for (let type of Object.keys(co2PerContentType)) {
    all.push({
      type,
      co2: co2PerContentType[type].co2,
      transferSize: co2PerContentType[type].transferSize
    });
  }
  all.sort(function(a, b) {
    return b.co2 - a.co2;
  });
  return all;
}

function dirtiestResources(pageXray, greenDomains) {
  const allAssets = [];
  for (let asset of pageXray.assets) {
    const domain = url.parse(asset.url).domain;
    const transferSize = asset.transferSize;
    const co2ForTransfer = getCO2PerByte(
      transferSize,
      greenDomains && greenDomains.indexOf(domain) > -1
    );
    allAssets.push({ url: asset.url, co2: co2ForTransfer, transferSize });
  }
  allAssets.sort(function(a, b) {
    return b.co2 - a.co2;
  });

  return allAssets.slice(0, allAssets.length > 10 ? 10 : allAssets.length);
}

function getCO2PerParty(pageXray, greenDomains) {
  let firstParty = 0;
  let thirdParty = 0;
  // calculate co2 per first/third party
  const firstPartyRegEx = pageXray.firstPartyRegEx;
  for (let d of Object.keys(pageXray.domains)) {
    if (!d.match(firstPartyRegEx)) {
      thirdParty += getCO2PerByte(
        pageXray.domains[d].transferSize,
        greenDomains && greenDomains.indexOf(d) > -1
      );
    } else {
      firstParty += getCO2PerByte(
        pageXray.domains[d].transferSize,
        greenDomains && greenDomains.indexOf(d) > -1
      );
    }
  }
  return { firstParty, thirdParty };
}

module.exports = {
  perByte: getCO2PerByte,
  perDomain: getCO2PerDomain,
  perPage: getCO2perPage,
  perParty: getCO2PerParty,
  perContentType: getCO2PerContentType,
  dirtiestResources
};
