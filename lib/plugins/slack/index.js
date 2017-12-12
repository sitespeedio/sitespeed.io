'use strict';

const throwIfMissing = require('../../support/util').throwIfMissing;
const Promise = require('bluebird');
const log = require('intel').getLogger('sitespeedio.plugin.slack');
const Slack = require('node-slack');
const merge = require('lodash.merge');
const set = require('lodash.set');
const DataCollector = require('./dataCollector');
const getAttachments = require('./attachements');
const getSummary = require('./summary');

Promise.promisifyAll(Slack.prototype);

const defaultConfig = {
  userName: 'Sitespeed.io',
  type: 'all',
  limitWarning: 90,
  limitError: 80,
  limitMetric: 'coachScore'
};

function send(options, dataCollector, context, screenshotType) {
  const slackOptions = merge({}, defaultConfig, options.slack);
  const slack = new Slack(slackOptions.hookUrl);
  const type = slackOptions.type;
  const pageErrors = [];
  let logo = 'https://www.sitespeed.io/img/slack/sitespeed-logo-slack.png';

  let channel = slackOptions.channel;
  if (channel && !channel.startsWith('#')) {
    channel = `#${channel}`;
  }

  for (const url of dataCollector.getURLs()) {
    const errors = dataCollector.getURLData(url).errors;
    if (errors) {
      pageErrors.push(errors);
    }
  }

  let text = '';

  if (['summary', 'all', 'error'].includes(type)) {
    const sum = getSummary(
      dataCollector,
      pageErrors,
      context.resultUrls,
      context.name,
      options
    );
    text += sum.summaryText + '\n' + sum.errorText;
    logo = sum.logo;
  }

  let attachments = [];
  if (['url', 'all', 'error'].includes(type)) {
    attachments = getAttachments(
      dataCollector,
      context.resultUrls,
      slackOptions,
      screenshotType
    );
  }

  if ((type === 'error' && pageErrors.length > 0) || type !== 'error') {
    log.debug(
      'Sending message to Slack channel %s and username %s',
      slackOptions.channel,
      slackOptions.userName
    );
    return slack
      .sendAsync({
        text,
        icon_url: logo,
        channel,
        mrkdwn: true,
        username: slackOptions.userName,
        attachments
      })
      .catch(e => {
        if (e.errno === 'ETIMEDOUT') {
          log.warn('Timeout sending Slack message.');
        } else {
          throw e;
        }
      });
  }
}

module.exports = {
  open(context, options) {
    throwIfMissing(options.slack, ['hookUrl', 'userName'], 'slack');
    this.dataCollector = new DataCollector(context);
    this.context = context;
    this.options = options;
    this.screenshotType;
  },
  processMessage(message) {
    const dataCollector = this.dataCollector;

    switch (message.type) {
      case 'error': {
        dataCollector.addErrorForUrl(message.url, message.source, message.data);
        break;
      }

      case 'browsertime.run':
      case 'browsertime.pageSummary':
      case 'pagexray.run':
      case 'pagexray.pageSummary':
      case 'coach.run':
      case 'coach.pageSummary': {
        dataCollector.addDataForUrl(
          message.url,
          message.type,
          message.data,
          message.runIndex
        );
        break;
      }

      case 'coach.summary':
      case 'pagexray.summary':
      case 'browsertime.summary': {
        const data = {};
        set(data, message.type, message.data);
        dataCollector.addSummary(data);
        break;
      }
      // collect screenshot type
      case 'browsertime.config': {
        if (message.data.screenshot === true) {
          this.screenshotType = message.data.screenshotType;
        }
        break;
      }

      case 'html.finished': {
        // if we have set a result base URL wait on
        // the content to be uploaded
        if (!this.options.resultBaseURL) {
          return send(
            this.options,
            dataCollector,
            this.context,
            this.screenshotType
          );
        }
        break;
      }

      case 'gc.finished':
      case 'ftp.finished':
      case 's3.finished': {
        return send(
          this.options,
          dataCollector,
          this.context,
          this.screenshotType
        );
      }
    }
  },
  config: defaultConfig
};
