'use strict';

const flatten = require('../../support/flattenMessage'),
  merge = require('lodash.merge'),
  util = require('../../support/tsdbUtil'),
  reduce = require('lodash.reduce');

class InfluxDBDataGenerator {
  constructor(includeQueryParams, options) {
    this.includeQueryParams = !!includeQueryParams;
    this.options = options;
    this.defaultTags = {};
    for (var row of options.influxdb.tags.split(',')) {
      const keyAndValue = row.split('=');
      this.defaultTags[keyAndValue[0]] = keyAndValue[1];
    }
  }

  dataFromMessage(message, time) {
    function getTagsFromMessage(
      message,
      includeQueryParams,
      options,
      defaultTags
    ) {
      const tags = merge({}, defaultTags);
      let typeParts = message.type.split('.');
      tags.origin = typeParts[0];
      typeParts.push(typeParts.shift());
      tags.summaryType = typeParts[0];

      // always have browser and connectivity in Browsertime and related tools
      if (message.type.match(/(^pagexray|^coach|^browsertime)/)) {
        // if we have a friendly name for your connectivity, use that!
        let connectivity = util.getConnectivity(options);
        tags.connectivity = connectivity;
        tags.browser = options.browser;
      } else if (message.type.match(/(^webpagetest)/)) {
        if (message.connectivity) {
          tags.connectivity = message.connectivity;
        }
        if (message.location) {
          tags.location = message.location;
        }
      }

      // if we get a URL type, add the URL
      if (message.url) {
        const urlAndGroup = util
          .getURLAndGroup(
            options,
            message.group,
            message.url,
            includeQueryParams
          )
          .split('.');
        tags.page = urlAndGroup[1];
        tags.group = urlAndGroup[0];
      } else if (message.group) {
        // add the group of the summary message
        tags.group = util.toSafeKey(message.group);
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
        'mdev'
      ];
      const keyArray = key.split('.');
      const end = keyArray.pop();
      if (functions.indexOf(end) > -1) {
        return { field: end, seriesName: keyArray.pop() };
      }
      return { field: 'value', seriesName: end };
    }

    function getAdditionalTags(key, type) {
      let tags = {};
      const keyArray = key.split('.');
      if (key.match(/(^contentTypes)/)) {
        // contentTypes.favicon.requests.mean
        // contentTypes.favicon.requests
        // contentTypes.css.transferSize
        tags.contentType = keyArray[1];
      } else if (key.match(/(^pageTimings|^visualMetrics)/)) {
        // pageTimings.serverResponseTime.max
        // visualMetrics.SpeedIndex.median
        tags.timings = keyArray[0];
      } else if (type === 'browsertime.pageSummary') {
        // statistics.timings.pageTimings.backEndTime.median
        // statistics.timings.rumSpeedIndex.median
        // statistics.timings.userTimings.marks.logoTime.median
        // statistics.visualMetrics.SpeedIndex.median
        tags[keyArray[0]] = keyArray[1];
        if (keyArray.length >= 5) {
          tags[keyArray[2]] = keyArray[3];
        }
      } else if (type === 'browsertime.summary') {
        // firstPaint.median
        // userTimings.marks.logoTime.median
        if (key.indexOf('userTimings') > -1) {
          tags[keyArray[0]] = keyArray[1];
        }
      } else if (type === 'coach.pageSummary') {
        // advice.score
        // advice.performance.score
        if (keyArray.length > 2) {
          tags.advice = keyArray[1];
        }
      } else if (type === 'coach.summary') {
        // score.max
        // performance.score.median
        if (keyArray.length === 3) {
          tags.advice = keyArray[0];
        }
      } else if (type === 'webpagetest.pageSummary') {
        // data.median.firstView.SpeedIndex webpagetest.pageSummary
        tags.view = keyArray[2];
        // data.median.firstView.breakdown.html.requests
        // data.median.firstView.breakdown.html.bytes
        if (key.indexOf('breakdown') > -1) {
          tags.contentType = keyArray[4];
        }
      } else if (type === 'webpagetest.summary') {
        // timing.firstView.SpeedIndex.median
        tags.view = keyArray[1];
        // asset.firstView.breakdown.html.requests.median
        if (key.indexOf('breakdown') > -1) {
          tags.contentType = keyArray[4];
        }
      } else if (type === 'pagexray.summary') {
        // firstParty.requests.min pagexray.summary
        // requests.median
        // responseCodes.307.max pagexray.summary
        // requests.min pagexray.summary
        if (key.indexOf('responseCodes') > -1) {
          tags.responseCodes = 'response';
        }

        if (key.indexOf('firstParty') > -1 || key.indexOf('thirdParty') > -1) {
          tags.party = keyArray[0];
        }
      } else if (type === 'pagexray.pageSummary') {
        // thirdParty.contentTypes.json.requests pagexray.pageSummary
        // thirdParty.requests pagexray.pageSummary
        // firstParty.cookieStats.max pagexray.pageSummary
        // responseCodes.200 pagexray.pageSummary
        // expireStats.max pagexray.pageSummary
        // totalDomains pagexray.pageSummary
        if (key.indexOf('firstParty') > -1 || key.indexOf('thirdParty') > -1) {
          tags.party = keyArray[0];
        }
        if (key.indexOf('responseCodes') > -1) {
          tags.responseCodes = 'response';
        }
        if (key.indexOf('contentTypes') > -1) {
          tags.contentType = keyArray[2];
        }
      } else {
        // console.log('Missed added tags to ' + key + ' ' + type);
      }
      return tags;
    }

    return reduce(
      flatten.flattenMessageData(message),
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

module.exports = InfluxDBDataGenerator;
