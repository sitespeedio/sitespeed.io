'use strict';

const statsHelpers = require('../../support/statsHelpers');

class Aggregator {
  constructor(options) {
    this.options = options;
    this.groups = {};
    this.urls = {};
    this.total = {};
    this.hostingInfo = {};
    this.urlToGroup = {};
  }

  addStats(data, group, url) {
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
    }

    if (this.urls[url] === undefined) {
      this.urls[url] = {};
    }

    this.hostingInfo[url] = data.hostingInfo;
    this.urlToGroup[url] = group;

    statsHelpers.pushStats(this.total, ['totalCO2'], data.totalCO2);
    statsHelpers.pushStats(this.total, ['co2PerPageView'], data.co2PerPageView);
    statsHelpers.pushStats(
      this.total,
      ['co2FirstParty'],
      data.co2PerParty.firstParty
    );
    statsHelpers.pushStats(
      this.total,
      ['co2ThirdParty'],
      data.co2PerParty.thirdParty
    );

    statsHelpers.pushGroupStats(
      this.urls[url],
      this.groups[group],
      ['totalCO2'],
      data.totalCO2
    );

    statsHelpers.pushGroupStats(
      this.urls[url],
      this.groups[group],
      ['co2PerPageView'],
      data.co2PerPageView
    );

    statsHelpers.pushGroupStats(
      this.urls[url],
      this.groups[group],
      ['co2FirstParty'],
      data.co2PerParty.firstParty
    );

    statsHelpers.pushGroupStats(
      this.urls[url],
      this.groups[group],
      ['co2ThirdParty'],
      data.co2PerParty.thirdParty
    );

    statsHelpers.pushGroupStats(
      this.urls[url],
      this.groups[group],
      ['totalTransfer'],
      data.transferPerPage
    );

    statsHelpers.pushGroupStats(
      this.urls[url],
      this.groups[group],
      ['firstPartyTransferPerPage'],
      data.firstPartyTransferPerPage
    );

    statsHelpers.pushGroupStats(
      this.urls[url],
      this.groups[group],
      ['thirdPartyTransferPerPage'],
      data.thirdPartyTransferPerPage || 0
    );
  }

  summarize() {
    const summary = {
      urlToGroup: this.urlToGroup,
      hostingInfo: this.hostingInfo
    };

    for (let type of Object.keys(this.total)) {
      statsHelpers.setStatsSummaryWithOptions(
        summary,
        ['groups', ['total'], type],
        this.total[type],
        { decimals: 5 }
      );
    }

    for (let url of Object.keys(this.urls)) {
      for (let type of Object.keys(this.urls[url])) {
        statsHelpers.setStatsSummaryWithOptions(
          summary,
          ['urls', url, type],
          this.urls[url][type],
          { decimals: 5 }
        );
      }
    }

    for (let group of Object.keys(this.groups)) {
      for (let type of Object.keys(this.groups[group])) {
        statsHelpers.setStatsSummaryWithOptions(
          summary,
          ['groups', group, type],
          this.groups[group][type],
          { decimals: 5 }
        );
      }
    }

    return summary;
  }
}

module.exports = Aggregator;
