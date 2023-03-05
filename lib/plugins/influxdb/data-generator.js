import merge from 'lodash.merge';
import reduce from 'lodash.reduce';

import { flattenMessageData } from '../../support/flattenMessage.js';
import {
  getConnectivity,
  getURLAndGroup,
  toSafeKey
} from '../../support/tsdbUtil.js';

function getAdditionalTags(key, type) {
  let tags = {};
  const keyArray = key.split('.');
  if (/(^contentTypes)/.test(key)) {
    // contentTypes.favicon.requests.mean
    // contentTypes.favicon.requests
    // contentTypes.css.transferSize
    tags.contentType = keyArray[1];
  } else if (/(^pageTimings|^visualMetrics)/.test(key)) {
    // pageTimings.serverResponseTime.max
    // visualMetrics.SpeedIndex.median
    tags.timings = keyArray[0];
  } else
    switch (type) {
      case 'browsertime.pageSummary': {
        // statistics.timings.pageTimings.backEndTime.median
        // statistics.timings.userTimings.marks.logoTime.median
        // statistics.visualMetrics.SpeedIndex.median
        tags[keyArray[0]] = keyArray[1];
        if (keyArray.length >= 5) {
          tags[keyArray[2]] = keyArray[3];
        }
        if (key.includes('cpu.categories')) {
          tags.cpu = 'category';
        } else if (key.includes('cpu.events')) {
          tags.cpu = 'event';
        } else if (key.includes('cpu.longTasks')) {
          tags.cpu = 'longTask';
        }

        break;
      }
      case 'browsertime.summary': {
        // firstPaint.median
        // userTimings.marks.logoTime.median
        if (key.includes('userTimings')) {
          tags[keyArray[0]] = keyArray[1];
        }

        break;
      }
      case 'coach.pageSummary': {
        // advice.score
        // advice.performance.score
        if (keyArray.length > 2) {
          tags.advice = keyArray[1];
        }

        // set the actual advice name
        // advice.performance.adviceList.cacheHeaders.score
        if (keyArray.length > 4) {
          tags.adviceName = keyArray[3];
        }

        break;
      }
      case 'coach.summary': {
        // score.max
        // performance.score.median
        if (keyArray.length === 3) {
          tags.advice = keyArray[0];
        }

        break;
      }
      case 'webpagetest.pageSummary': {
        // data.median.firstView.SpeedIndex webpagetest.pageSummary
        tags.view = keyArray[2];
        // data.median.firstView.breakdown.html.requests
        // data.median.firstView.breakdown.html.bytes
        if (key.includes('breakdown')) {
          tags.contentType = keyArray[4];
        }

        break;
      }
      case 'webpagetest.summary': {
        // timing.firstView.SpeedIndex.median
        tags.view = keyArray[1];
        // asset.firstView.breakdown.html.requests.median
        if (key.includes('breakdown')) {
          tags.contentType = keyArray[4];
        }

        break;
      }
      case 'pagexray.summary': {
        // firstParty.requests.min pagexray.summary
        // requests.median
        // responseCodes.307.max pagexray.summary
        // requests.min pagexray.summary
        if (key.includes('responseCodes')) {
          tags.responseCodes = 'response';
        }

        if (key.includes('firstParty') || key.includes('thirdParty')) {
          tags.party = keyArray[0];
        }

        break;
      }
      case 'pagexray.pageSummary': {
        // thirdParty.contentTypes.json.requests pagexray.pageSummary
        // thirdParty.requests pagexray.pageSummary
        // firstParty.cookieStats.max pagexray.pageSummary
        // responseCodes.200 pagexray.pageSummary
        // expireStats.max pagexray.pageSummary
        // totalDomains pagexray.pageSummary
        if (key.includes('firstParty') || key.includes('thirdParty')) {
          tags.party = keyArray[0];
        }
        if (key.includes('responseCodes')) {
          tags.responseCodes = 'response';
        }
        if (key.includes('contentTypes')) {
          tags.contentType = keyArray[2];
        }

        break;
      }
      case 'thirdparty.pageSummary': {
        tags.thirdPartyCategory = keyArray[1];
        tags.thirdPartyType = keyArray[2];

        break;
      }
      case 'lighthouse.pageSummary': {
        // categories.seo.score
        // categories.performance.score
        if (key.includes('score')) {
          tags.audit = keyArray[1];
        }
        if (key.includes('audits')) {
          tags.audit = keyArray[1];
        }

        break;
      }
      case 'crux.pageSummary': {
        tags.experience = keyArray[0];
        tags.formFactor = keyArray[1];
        tags.metric = keyArray[2];

        break;
      }
      case 'gpsi.pageSummary': {
        if (key.includes('googleWebVitals')) {
          tags.testType = 'googleWebVitals';
        } else if (key.includes('score')) {
          tags.testType = 'score';
        } else if (key.includes('loadingExperience')) {
          tags.experience = keyArray[0];
          tags.metric = keyArray[1];
          tags.testType = 'crux';
        }

        break;
      }
      default:
      // console.log('Missed added tags to ' + key + ' ' + type);
    }
  return tags;
}

function getFieldAndSeriesName(key) {
  const functions = [
    'min',
    'p10',
    'median',
    'mean',
    'avg',
    'max',
    'p90',
    'p99',
    'mdev',
    'stddev'
  ];
  const keyArray = key.split('.');
  const end = keyArray.pop();
  if (functions.includes(end)) {
    return { field: end, seriesName: keyArray.pop() };
  }
  return { field: 'value', seriesName: end };
}
export class InfluxDBDataGenerator {
  constructor(includeQueryParameters, options) {
    this.includeQueryParams = !!includeQueryParameters;
    this.options = options;
    this.defaultTags = {};
    for (let row of options.influxdb.tags.split(',')) {
      const keyAndValue = row.split('=');
      this.defaultTags[keyAndValue[0]] = keyAndValue[1];
    }
  }

  dataFromMessage(message, time, alias) {
    function getTagsFromMessage(
      message,
      includeQueryParameters,
      options,
      defaultTags
    ) {
      const tags = merge({}, defaultTags);
      let typeParts = message.type.split('.');
      tags.origin = typeParts[0];
      typeParts.push(typeParts.shift());
      tags.summaryType = typeParts[0];

      // always have browser and connectivity in Browsertime and related tools
      if (
        /(^pagexray|^coach|^browsertime|^thirdparty|^axe|^sustainable)/.test(
          message.type
        )
      ) {
        // if we have a friendly name for your connectivity, use that!
        let connectivity = getConnectivity(options);
        tags.connectivity = connectivity;
        tags.browser = options.browser;
      } else if (/(^webpagetest)/.test(message.type)) {
        if (message.connectivity) {
          tags.connectivity = message.connectivity;
        }
        if (message.location) {
          tags.location = message.location;
        }
      } else if (/(^gpsi)/.test(message.type)) {
        tags.strategy = options.mobile ? 'mobile' : 'desktop';
      }

      // if we get a URL type, add the URL
      if (message.url) {
        const urlAndGroup = getURLAndGroup(
          options,
          message.group,
          message.url,
          includeQueryParameters,
          alias
        ).split('.');
        tags.page = urlAndGroup[1];
        tags.group = urlAndGroup[0];
      } else if (message.group) {
        // add the group of the summary message
        tags.group = toSafeKey(message.group, options.influxdb.groupSeparator);
      }

      tags.testName = options.slug;

      return tags;
    }
    return reduce(
      flattenMessageData(message),
      (entries, value, key) => {
        const fieldAndSeriesName = getFieldAndSeriesName(key);
        let tags = getTagsFromMessage(
          message,
          this.includeQueryParams,
          this.options,
          this.defaultTags
        );
        tags = merge(getAdditionalTags(key, message.type), tags);
        let point = {
          time: time.valueOf()
        };
        point[fieldAndSeriesName.field] = value;
        entries.push({
          tags,
          seriesName: fieldAndSeriesName.seriesName,
          point
        });
        return entries;
      },
      []
    );
  }
}
