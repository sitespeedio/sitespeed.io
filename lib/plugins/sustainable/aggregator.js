'use strict';

const Stats = require('fast-stats').Stats;
const statsHelpers = require('../../support/statsHelpers');

class Aggregator {
  constructor(options) {
    this.options = options;
    this.urlsPerPage = {};
    this.urlsTotalCO2 = {};
    this.firstPartyCO2PerURL = {};
    this.thirdPartyCO2PerURL = {};
    this.groups = {};
    this.urlToGroup = {};
    this.hostingInfo = {};
  }

  addStats(data, group, url) {
    const urlsPerPage = this.urlsPerPage;
    const groups = this.groups;
    const urlToGroup = this.urlToGroup;
    const urlsTotalCO2 = this.urlsTotalCO2;
    const firstPartyCO2PerURL = this.firstPartyCO2PerURL;
    const thirdPartyCO2PerURL = this.thirdPartyCO2PerURL;
    if (!urlsPerPage[url]) {
      urlsPerPage[url] = new Stats();
      firstPartyCO2PerURL[url] = new Stats();
      thirdPartyCO2PerURL[url] = new Stats();
      urlToGroup[url] = group;
    }
    if (!urlsTotalCO2[url]) {
      urlsTotalCO2[url] = new Stats();
    }
    if (!groups[group]) {
      groups[group] = new Stats();
    }

    this.hostingInfo[url] = data.hostingInfo;

    // Collect co2 per tested URL and per group (=domain)
    // Later we could also do things like number of green servers
    urlsPerPage[url].push(data.co2PerPageView);
    groups[group].push(data.co2PerPageView);
    firstPartyCO2PerURL[url].push(data.co2PerParty.firstParty);
    thirdPartyCO2PerURL[url].push(data.co2PerParty.thirdParty);
    if (data.totalCO2) {
      urlsTotalCO2[url].push(data.totalCO2);
    }
  }

  summarize() {
    const urlStats = [];
    // Let summarize the group data later on
    for (let url of Object.keys(this.urlsPerPage)) {
      urlStats.push({
        url,
        group: this.urlToGroup[url],
        data: {
          co2PerPageView: statsHelpers.summarizeStats(this.urlsPerPage[url], {
            decimals: 3
          }),
          totalCO2: statsHelpers.summarizeStats(this.urlsTotalCO2[url], {
            decimals: 3
          }),
          hostingInfo: this.hostingInfo[url],
          co2PerParty: {
            thirdParty: statsHelpers.summarizeStats(
              this.thirdPartyCO2PerURL[url],
              {
                decimals: 3
              }
            ),
            firstParty: statsHelpers.summarizeStats(
              this.firstPartyCO2PerURL[url],
              {
                decimals: 3
              }
            )
          }
        }
      });
    }
    return urlStats;
  }
}

module.exports = Aggregator;
