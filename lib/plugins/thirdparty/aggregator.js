'use strict';

const statsHelpers = require('../../support/statsHelpers');

module.exports = {
  urls: {},
  categories: {},
  totalRequests: {},
  cpuPerTool: {},

  addToAggregate(
    url,
    requestsByCategory,
    toolsByCategory,
    totalThirdPartyRequests,
    cpuPerTool
  ) {
    if (this.urls[url] === undefined) {
      this.urls[url] = {};
      this.categories[url] = {};
      this.totalRequests[url] = {};
      this.cpuPerTool[url] = {};
    }

    statsHelpers.pushStats(
      this.totalRequests[url],
      'totalRequests',
      totalThirdPartyRequests
    );

    for (let category of Object.keys(requestsByCategory)) {
      statsHelpers.pushStats(
        this.urls[url],
        category,
        requestsByCategory[category]
      );
    }

    for (let category of Object.keys(toolsByCategory)) {
      statsHelpers.pushStats(
        this.categories[url],
        category,
        Object.keys(toolsByCategory[category]).length
      );
    }

    for (let tool of Object.keys(cpuPerTool)) {
      statsHelpers.pushStats(
        this.cpuPerTool[url],
        tool.replace(/\./g, '_'),
        cpuPerTool[tool]
      );
    }
  },
  summarize() {
    const summary = {};
    for (let url of Object.keys(this.urls)) {
      summary[url] = {
        category: {
          survelliance: { requests: { median: 0 }, tools: { median: 0 } }
        }
      };
      // Collect how many requests that is done per type
      for (let category of Object.keys(this.urls[url])) {
        statsHelpers.setStatsSummary(
          summary[url],
          'category.' + category + '.requests',
          this.urls[url][category]
        );
      }
      // And also collect per category
      for (let category of Object.keys(this.categories[url])) {
        statsHelpers.setStatsSummary(
          summary[url],
          'category.' + category + '.tools',
          this.categories[url][category]
        );
      }

      for (let tool of Object.keys(this.cpuPerTool[url])) {
        statsHelpers.setStatsSummary(
          summary[url],
          'tool.' + tool + '.cpu',
          this.cpuPerTool[url][tool]
        );
      }

      statsHelpers.setStatsSummary(
        summary[url],
        'requests',
        this.totalRequests[url]['totalRequests']
      );
    }

    return summary;
  }
};
