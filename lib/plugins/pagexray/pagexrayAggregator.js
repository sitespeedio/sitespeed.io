import forEach from 'lodash.foreach';

import { pushGroupStats, setStatsSummary } from '../../support/statsHelpers.js';

const METRIC_NAMES = ['transferSize', 'contentSize', 'requests'];

export class PageXrayAggregator {
  constructor() {
    this.stats = {};
    this.groups = {};
  }

  addToAggregate(pageSummary, group) {
    if (this.groups[group] === undefined) {
      this.groups[group] = {};
    }

    let stats = this.stats;
    let groups = this.groups;

    for (const summary of pageSummary) {
      // stats for the whole page
      for (const metric of METRIC_NAMES) {
        // There's a bug in Firefox/https://github.com/devtools-html/har-export-trigger
        // that sometimes generate content size that is null, see
        // https://github.com/sitespeedio/sitespeed.io/issues/2090
        if (!Number.isNaN(summary[metric])) {
          pushGroupStats(stats, groups[group], metric, summary[metric]);
        }
      }

      for (const contentType of Object.keys(summary.contentTypes)) {
        for (const metric of METRIC_NAMES) {
          // There's a bug in Firefox/https://github.com/devtools-html/har-export-trigger
          // that sometimes generate content size that is null, see
          // https://github.com/sitespeedio/sitespeed.io/issues/2090
          if (!Number.isNaN(summary.contentTypes[contentType][metric])) {
            pushGroupStats(
              stats,
              groups[group],
              'contentTypes.' + contentType + '.' + metric,
              summary.contentTypes[contentType][metric]
            );
          }
        }
      }

      for (const responseCode of Object.keys(summary.responseCodes)) {
        pushGroupStats(
          stats,
          groups[group],
          'responseCodes.' + responseCode,
          summary.responseCodes[responseCode]
        );
      }
      /*
      for (const responseCode of Object.keys(summary.responseCodes)) {
        pushGroupStats(
          stats,
          groups[group],
          'responseCodes.' + responseCode,
          summary.responseCodes[responseCode]
        );
      }*/

      // extras for firstParty vs third
      if (summary.firstParty.requests) {
        for (const metric of METRIC_NAMES) {
          if (summary.firstParty[metric] !== undefined) {
            pushGroupStats(
              stats,
              groups[group],
              'firstParty' + '.' + metric,
              summary.firstParty[metric]
            );
          }
          if (summary.thirdParty[metric] !== undefined) {
            pushGroupStats(
              stats,
              groups[group],
              'thirdParty' + '.' + metric,
              summary.thirdParty[metric]
            );
          }
        }
      }

      // Add the total amount of domains on this page
      pushGroupStats(
        stats,
        groups[group],
        'domains',
        Object.keys(summary.domains).length
      );

      // And the total amounts of cookies
      pushGroupStats(stats, groups[group], 'cookies', summary.cookies);

      forEach(summary.assets, asset => {
        pushGroupStats(stats, groups[group], 'expireStats', asset.expires);
        pushGroupStats(
          stats,
          groups[group],
          'lastModifiedStats',
          asset.timeSinceLastModified
        );
      });
    }
  }
  summarize() {
    if (Object.keys(this.stats).length === 0) {
      return;
    }

    const total = this.summarizePerObject(this.stats);
    // This is an old bug we send total on the side and not in the group
    // we send them both ways to be backward compatible
    const summary = {
      total,
      groups: { total }
    };

    for (let group of Object.keys(this.groups)) {
      summary.groups[group] = this.summarizePerObject(this.groups[group]);
    }
    return summary;
  }
  summarizePerObject(type) {
    return Object.keys(type).reduce((summary, name) => {
      if (
        METRIC_NAMES.includes(name) ||
        /(^domains|^expireStats|^lastModifiedStats|^cookies)/.test(name)
      ) {
        setStatsSummary(summary, name, type[name]);
      } else {
        if (name === 'contentTypes') {
          const contentTypeData = {};
          forEach(Object.keys(type[name]), contentType => {
            forEach(type[name][contentType], (stats, metric) => {
              setStatsSummary(contentTypeData, [contentType, metric], stats);
            });
          });
          summary[name] = contentTypeData;
        } else if (name === 'responseCodes') {
          const responseCodeData = {};
          for (const [metric, stats] of type.responseCodes.entries()) {
            if (stats != undefined)
              setStatsSummary(responseCodeData, metric, stats);
          }
          summary[name] = responseCodeData;
        } else {
          const data = {};
          forEach(type[name], (stats, metric) => {
            setStatsSummary(data, metric, stats);
          });
          summary[name] = data;
        }
      }
      return summary;
    }, {});
  }
}
