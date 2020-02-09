'use strict';

const Stats = require('fast-stats').Stats;
const statsHelpers = require('../../support/statsHelpers');

class Aggregator {
  constructor(options) {
    this.options = options;
    this.urls = {};
    this.groups = {};
    this.urlToGroup = {};
  }

  addStats(data, group, url) {
    const urls = this.urls;
    const groups = this.groups;
    const urlToGroup = this.urlToGroup;
    if (!urls[url]) {
      urls[url] = new Stats();
      urlToGroup[url] = group;
    }
    if (!groups[group]) {
      groups[group] = new Stats();
    }

    // Collect co2 per tested URL and per group (=domain)
    // Later we could also do things like number of green servers
    urls[url].push(data.co2);
    groups[group].push(data.co2);
  }

  summarize() {
    const urlStats = [];
    // Let sumarize the group data later on
    for (let url of Object.keys(this.urls)) {
      urlStats.push({
        url,
        group: this.urlToGroup[url],
        data: { co2: statsHelpers.summarizeStats(this.urls[url]) }
      });
    }
    return urlStats;
  }
}

module.exports = Aggregator;
