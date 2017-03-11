'use strict';

const throwIfMissing = require('../../support/util').throwIfMissing;
const Promise = require('bluebird');
const path = require('path');
const log = require('intel');
const Slack = require('node-slack');
const merge = require('lodash.merge');
const getAttachments = require('./attachements');
const getSummary = require('./summary');

Promise.promisifyAll(Slack.prototype);

const defaultConfig = {
  userName: 'Sitespeed.io',
  type: 'all',
  limitWarning: 80,
  limitError: 90,
  limitMetric: 'coachScore'
};

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    throwIfMissing(options.slack, ['hookUrl', 'userName'], 'slack');
    this.data = context.dataCollection;
  },
  close(options) {
    options = merge({}, defaultConfig, options.slack);
    const slack = new Slack(options.hookUrl);
    const type = options.type;
    const pageErrors = [];
    let logo = "https://www.sitespeed.io/img/slack/sitespeed-logo-slack.png";

    let channel = options.channel;
    if (channel && !channel.startsWith('#')) {
      channel = `#${channel}`;
    }

    for (const url of Object.keys(this.data.urlPages)) {
      if (this.data.urlPages[url].errors) {
        pageErrors.push(this.data.urlPages[url].errors);
      }
    }

    let text = '';

    if (['summary', 'all', 'error'].includes(type)) {
      const sum = getSummary(this.data, options, pageErrors);
      text += sum.summaryText + '\n' + sum.errorText;
      logo = sum.logo;
    }

    const attachments = [];
    if (['url', 'all', 'error'].includes(type)) {
      attachments.concat(getAttachments(this.data, options));
    }

    if (type === 'error' && pageErrors.length > 0 || type !== 'error') {
      log.debug('Sending message to Slack channel %s and username %s', options.channel, options.userName);
      return slack.sendAsync({
        text,
        icon_url: logo,
        channel,
        mrkdwn: true,
        username: options.userName,
        attachments
      })
    }
  },
  config: defaultConfig
};
