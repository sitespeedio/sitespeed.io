import { parse } from 'node:url';

import coach from 'coach-core';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';

import { ThirdPartyAggregator } from './aggregator.js';

const { getThirdPartyWeb } = coach;
const { getEntity } = getThirdPartyWeb();

const DEFAULT_THIRDPARTY_PAGESUMMARY_METRICS = [
  'category.*.requests.*',
  'category.*.tools.*',
  'requests.*',
  'cookies.*'
];

const DEFAULT_THIRDPARTY_RUN_METRICS = [];

export default class ThirdPartyPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'thirdparty', options, context, queue });
  }

  open(context, options) {
    this.metrics = {};
    this.options = options;
    this.context = context;
    this.make = context.messageMaker('thirdparty').make;
    this.groups = {};
    this.runsPerUrl = {};
    this.urlAndGroup = {};
    this.thirdPartyAggregator = new ThirdPartyAggregator();

    if (options.thirdParty && options.thirdParty.cpu) {
      DEFAULT_THIRDPARTY_PAGESUMMARY_METRICS.push('tool.*');
    }
    context.filterRegistry.registerFilterForType(
      DEFAULT_THIRDPARTY_PAGESUMMARY_METRICS,
      'thirdparty.pageSummary'
    );
    context.filterRegistry.registerFilterForType(
      DEFAULT_THIRDPARTY_RUN_METRICS,
      'thirdparty.run'
    );
  }
  processMessage(message, queue) {
    const make = this.make;
    const thirdPartyAssetsByCategory = {};
    const toolsByCategory = {};
    const possibileMissedThirdPartyDomains = [];
    if (message.type === 'pagexray.run') {
      const cookies = message.data.thirdParty.cookies;
      const firstPartyRegEx = new RegExp(message.data.firstPartyRegEx);
      for (let d of Object.keys(message.data.domains)) {
        const entity = d.includes('localhost') ? undefined : getEntity(d);
        if (entity === undefined && !firstPartyRegEx.test(d)) {
          possibileMissedThirdPartyDomains.push(d);
        }
      }
      const byCategory = {};
      this.groups[message.url] = message.group;
      let company;
      try {
        company = message.url.includes('localhost')
          ? undefined
          : getEntity(message.url);
      } catch {
        // Do nada
      }
      let totalThirdPartyRequests = 0;
      for (let asset of message.data.assets) {
        let entity;
        try {
          entity = asset.url.includes('localhost')
            ? undefined
            : getEntity(asset.url);
        } catch {
          // Do nada
        }
        if (entity === undefined) {
          // We don't have a match for this request, check agains the regex
          if (!firstPartyRegEx.test(asset.url)) {
            byCategory['unknown'] = byCategory['unknown']
              ? byCategory['unknown'] + 1
              : 1;
          }
        } else {
          if (company && company.name === entity.name) {
            // Testing comnpanies that themselves are a third party gives a high third party score
            // so we should remove the ones.
            continue;
          }
          totalThirdPartyRequests++;
          if (
            (entity.name.includes('Google') ||
              entity.name.includes('Facebook') ||
              entity.name.includes('AMP') ||
              entity.name.includes('YouTube')) &&
            !entity.categories.includes('survelliance')
          ) {
            entity.categories.push('survelliance');
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
        }
      }

      const cpuPerTool = {};
      if (message.data.cpu && message.data.cpu.urls) {
        for (let ent of message.data.cpu.urls) {
          // Seen errors like  "Unable to find domain in "about:blank"
          if (ent.url && ent.url.startsWith('http')) {
            let entity = getEntity(ent.url);
            // fallback to domain
            if (!entity) {
              const hostname = ent.url.startsWith('http')
                ? parse(ent.url).hostname
                : ent.url;
              entity = {
                name: hostname
              };
            }
            if (cpuPerTool[entity.name]) {
              cpuPerTool[entity.name] += ent.value;
            } else {
              cpuPerTool[entity.name] = ent.value;
            }
          }
        }
      }

      this.thirdPartyAggregator.addToAggregate(
        message.url,
        byCategory,
        toolsByCategory,
        totalThirdPartyRequests,
        cpuPerTool,
        cookies,
        message.data.assets.length
      );

      const runData = {
        category: byCategory,
        assets: thirdPartyAssetsByCategory,
        toolsByCategory,
        possibileMissedThirdPartyDomains: possibileMissedThirdPartyDomains,
        requests: totalThirdPartyRequests,
        cookies,
        cpuPerTool
      };

      queue.postMessage(
        make('thirdparty.run', runData, {
          url: message.url,
          group: message.group,
          runIndex: message.runIndex
        })
      );
      // Store the group to use in summarize
      this.urlAndGroup[message.url] = message.group;
      if (this.runsPerUrl[message.url]) {
        this.runsPerUrl[message.url].push(runData);
      } else {
        this.runsPerUrl[message.url] = [runData];
      }
    } else if (message.type === 'sitespeedio.summarize') {
      let summary = this.thirdPartyAggregator.summarize();
      for (let url of Object.keys(summary)) {
        summary[url].runs = this.runsPerUrl[url];
        queue.postMessage(
          make('thirdparty.pageSummary', summary[url], {
            url,
            group: this.urlAndGroup[url]
          })
        );
      }
    }
  }
}
