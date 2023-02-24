import { pushStats, setStatsSummary } from '../../support/statsHelpers.js';

export class ThirdPartyAggregator {
  constructor() {
    this.urls = {};
    this.categories = {};
    this.totalRequests = {};
    this.thirdPartyPercentage = {};
    this.cpuPerTool = {};
    this.cookies = {};
  }

  addToAggregate(
    url,
    requestsByCategory,
    toolsByCategory,
    totalThirdPartyRequests,
    cpuPerTool,
    cookies,
    totalRequestsForThePage
  ) {
    if (this.urls[url] === undefined) {
      this.urls[url] = {};
      this.categories[url] = {};
      this.totalRequests[url] = {};
      this.cpuPerTool[url] = {};
      this.thirdPartyPercentage[url] = {};
      this.cookies[url] = {};
    }

    pushStats(
      this.totalRequests[url],
      'totalRequests',
      totalThirdPartyRequests
    );

    pushStats(this.cookies[url], 'cookies', cookies);

    pushStats(
      this.thirdPartyPercentage[url],
      'percentage',
      (totalThirdPartyRequests / totalRequestsForThePage) * 100
    );

    for (let category of Object.keys(requestsByCategory)) {
      pushStats(this.urls[url], category, requestsByCategory[category]);
    }

    for (let category of Object.keys(toolsByCategory)) {
      pushStats(
        this.categories[url],
        category,
        Object.keys(toolsByCategory[category]).length
      );
    }

    for (let tool of Object.keys(cpuPerTool)) {
      pushStats(
        this.cpuPerTool[url],
        tool.replace(/\./g, '_'),
        cpuPerTool[tool]
      );
    }
  }
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
        setStatsSummary(
          summary[url],
          'category.' + category + '.requests',
          this.urls[url][category]
        );
      }
      // And also collect per category
      for (let category of Object.keys(this.categories[url])) {
        setStatsSummary(
          summary[url],
          'category.' + category + '.tools',
          this.categories[url][category]
        );
      }

      for (let tool of Object.keys(this.cpuPerTool[url])) {
        setStatsSummary(
          summary[url],
          'tool.' + tool + '.cpu',
          this.cpuPerTool[url][tool]
        );
      }

      setStatsSummary(
        summary[url],
        'requests.total',
        this.totalRequests[url]['totalRequests']
      );

      setStatsSummary(summary[url], 'cookies', this.cookies[url]['cookies']);

      setStatsSummary(
        summary[url],
        'requests.percentage',
        this.thirdPartyPercentage[url]['percentage']
      );
    }

    return summary;
  }
}
