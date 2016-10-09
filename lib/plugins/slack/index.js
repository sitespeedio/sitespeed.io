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
  channel: '#general',
  type: 'summary'
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
  close(options, errors) {
    const slack = new Slack(this.options.hookUrl);
    let logo = "https://www.sitespeed.io/img/slack/sitespeed-logo-slack.png";

    if (!this.options.channel.startsWith('#')) {
      this.options.channel = '#' + this.options.channel;
    }

    let text = '';
    log.debug('Sending message to Slack channel %s and username %s', this.options.channel, this.options.userName);

    if (this.options.type === 'summary' || this.options.type === 'both') {
      const sum = summary.get(this.data, options, errors);
      text += sum.summaryText + '\n' + sum.errorText;
      logo = sum.logo;
    }
    let att = [];
    if (this.options.type === 'url' || this.options.type === 'both') {
      att = attachements.get(this.data);
    }

    return slack.sendAsync({
      text: text,
      icon_url: logo,
      channel: this.options.channel,
      mrkdwn: true,
      username: this.options.userName,
      attachments: att
    })
  },
  config: defaultConfig
}
