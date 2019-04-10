'use strict';

const { getEntity } = require('third-party-web');
const aggregator = require('./aggregator');

const DEFAULT_THIRDPARTY_PAGESUMMARY_METRICS = [
  'category.*.requests.*',
  'category.*.tools.*'
];

module.exports = {
  open(context, options) {
    this.metrics = {};
    this.options = options;
    this.context = context;
    this.make = context.messageMaker('thirdparty').make;
    this.groups = {};

    context.filterRegistry.registerFilterForType(
      DEFAULT_THIRDPARTY_PAGESUMMARY_METRICS,
      'thirdparty.pageSummary'
    );
  },
  processMessage(message, queue) {
    const make = this.make;
    const thirdPartyAssetsByCategory = {};
    const toolsByCategory = {};
    const possibileMissedThirdPartyDomains = [];
    if (message.type === 'pagexray.run') {
      const firstPartyRegEx = message.data.firstPartyRegEx;
      for (let d of Object.keys(message.data.domains)) {
        const entity = getEntity(d);
        if (entity !== undefined) {
          // Here is a match
        } else {
          if (!d.match(firstPartyRegEx)) {
            possibileMissedThirdPartyDomains.push(d);
          }
        }
      }
      const byCategory = {};
      this.groups[message.url] = message.group;
      let totalThirdPartyRequests = 0;
      for (let asset of message.data.assets) {
        const entity = getEntity(asset.url);
        if (entity !== undefined) {
          totalThirdPartyRequests++;
          if (
            entity.name.indexOf('Google') > -1 ||
            entity.name.indexOf('Facebook') > -1 ||
            entity.name.indexOf('AMP') > -1 ||
            entity.name.indexOf('YouTube') > -1
          ) {
            if (!entity.categories.includes('survelliance')) {
              entity.categories.push('survelliance');
            }
          }
          for (let category of entity.categories) {
            if (!toolsByCategory[category]) {
              toolsByCategory[category] = {};
            }
            if (byCategory[category]) {
              byCategory[category] = byCategory[category] + 1;
              thirdPartyAssetsByCategory[category].push({
                url: asset.url,
                entity
              });
            } else {
              byCategory[category] = 1;
              thirdPartyAssetsByCategory[category] = [];
              thirdPartyAssetsByCategory[category].push({
                url: asset.url,
                entity
              });
            }
            toolsByCategory[category][entity.name] = 1;
          }
        } else {
          // We don't have a match for this request, check agains the regex
          if (!asset.url.match(firstPartyRegEx)) {
            if (byCategory['unknown']) {
              byCategory['unknown'] = byCategory['unknown'] + 1;
            } else {
              byCategory['unknown'] = 1;
            }
          }
        }
      }
      aggregator.addToAggregate(
        message.url,
        byCategory,
        toolsByCategory,
        totalThirdPartyRequests
      );
      queue.postMessage(
        make(
          'thirdparty.run',
          {
            category: byCategory,
            assets: thirdPartyAssetsByCategory,
            toolsByCategory,
            possibileMissedThirdPartyDomains: possibileMissedThirdPartyDomains,
            requests: totalThirdPartyRequests
          },
          {
            url: message.url,
            group: message.group,
            runIndex: message.runIndex
          }
        )
      );
    } else if (message.type === 'sitespeedio.summarize') {
      let summary = aggregator.summarize();
      for (let url of Object.keys(summary)) {
        queue.postMessage(
          make('thirdparty.pageSummary', summary[url], {
            url,
            group: this.groups[url]
          })
        );
      }
    }
  }
};
