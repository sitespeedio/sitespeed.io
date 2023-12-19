// Moved from the co2.js project
// see https://github.com/thegreenwebfoundation/co2.js/issues/182

export function perDomain(pageXray, greenDomains, CO2) {
  const co2PerDomain = [];
  for (let domain of Object.keys(pageXray.domains)) {
    let co2;
    co2 =
      greenDomains && greenDomains.includes(domain)
        ? CO2.perByte(pageXray.domains[domain].transferSize, true)
        : CO2.perByte(pageXray.domains[domain].transferSize);
    co2PerDomain.push({
      domain,
      co2,
      transferSize: pageXray.domains[domain].transferSize
    });
  }
  co2PerDomain.sort((a, b) => b.co2 - a.co2);

  return co2PerDomain;
}

export function perPage(pageXray, green, CO2) {
  // Accept an xray object, and if we receive a boolean as the second
  // argument, we assume every request we make is sent to a server
  // running on renwewable power.

  // if we receive an array of domains, return a number accounting the
  // reduced CO2 from green hosted domains

  const domainCO2 = perDomain(pageXray, green, CO2);
  let totalCO2 = 0;
  for (let domain of domainCO2) {
    totalCO2 += domain.co2;
  }
  return totalCO2;
}

export function perContentType(pageXray, greenDomains, CO2) {
  const co2PerContentType = {};
  for (let asset of pageXray.assets) {
    const domain = new URL(asset.url).domain;
    const transferSize = asset.transferSize;
    const co2ForTransfer = CO2.perByte(
      transferSize,
      greenDomains && greenDomains.includes(domain)
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
  all.sort((a, b) => b.co2 - a.co2);
  return all;
}

export function getDirtiestResources(pageXray, greenDomains, CO2) {
  const allAssets = [];
  for (let asset of pageXray.assets) {
    const domain = new URL(asset.url).domain;
    const transferSize = asset.transferSize;
    const co2ForTransfer = CO2.perByte(
      transferSize,
      greenDomains && greenDomains.includes(domain)
    );
    allAssets.push({ url: asset.url, co2: co2ForTransfer, transferSize });
  }
  allAssets.sort((a, b) => b.co2 - a.co2);

  return allAssets.slice(0, allAssets.length > 10 ? 10 : allAssets.length);
}

export function perParty(pageXray, greenDomains, CO2) {
  let firstParty = 0;
  let thirdParty = 0;
  // calculate co2 per first/third party
  const firstPartyRegEx = pageXray.firstPartyRegEx;
  for (let d of Object.keys(pageXray.domains)) {
    if (d.match(firstPartyRegEx)) {
      thirdParty += CO2.perByte(
        pageXray.domains[d].transferSize,
        greenDomains && greenDomains.includes(d)
      );
    } else {
      firstParty += CO2.perByte(
        pageXray.domains[d].transferSize,
        greenDomains && greenDomains.includes(d)
      );
    }
  }
  return { firstParty, thirdParty };
}
