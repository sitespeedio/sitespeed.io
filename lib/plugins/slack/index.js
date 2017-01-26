'use strict';

let throwIfMissing = require('../../support/util').throwIfMissing,
  Promise = require('bluebird'),
  path = require('path'),
  log = require('intel'),
  Slack = require('node-slack'),
  merge = require('lodash.merge'),
  attachements = require('./attachements'),
  summary = require('./summary');

Promise.promisifyAll(Slack.prototype);

const defaultConfig = {
  userName: 'Sitespeed.io',
  type: 'all',
  limitWarning: 80,
  limitError: 90,
  limitMetric: 'coachScore'
}

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    throwIfMissing(options.slack, ['hookUrl', 'userName'], 'slack');
    this.data = context.dataCollection;
    this.options = merge({}, defaultConfig, options.slack);
  },
  close(options) {
    const slack = new Slack(this.options.hookUrl);
    const pageErrors = [];
    let logo = "https://www.sitespeed.io/img/slack/sitespeed-logo-slack.png";

    if (typeof this.options.channel !== 'undefined' && !this.options.channel.startsWith('#')) {
      this.options.channel = '#' + this.options.channel;
    }

    for (let url of Object.keys(this.data.urlPages)) {
      if (this.data.urlPages[url].errors) {
        pageErrors.push(this.data.urlPages[url].errors);
      }
    }

    let text = '';

    if (this.options.type === 'summary' || this.options.type === 'all' ||
      this.options.type === 'error') {
      const sum = summary.get(this.data, options, pageErrors);
      text += sum.summaryText + '\n' + sum.errorText;
      logo = sum.logo;
    }
    let att = [];
    if (this.options.type === 'url' || this.options.type === 'all' || this.options.type === 'error') {
      att = attachements.get(this.data, this.options);
    }

    if (this.options.type === 'error' && pageErrors.length > 0 || this.options.type != 'error') {
      log.debug('Sending message to Slack channel %s and username %s', this.options.channel, this.options.userName);
      return slack.sendAsync({
        text: text,
        icon_url: logo,
        channel: this.options.channel,
        mrkdwn: true,
        username: this.options.userName,
        attachments: att
      })
    } else {
      return
    }
  },
  config: defaultConfig
}
