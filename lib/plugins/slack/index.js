'use strict';

let throwIfMissing = require('../../support/util').throwIfMissing,
  Promise = require('bluebird'),
  path = require('path'),
  log = require('intel'),
  Slack = require('node-slack'),
  attachements = require('./attachements'),
  summary = require('./summary');

Promise.promisifyAll(Slack.prototype);

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    throwIfMissing(options.slack, ['hookUrl', 'userName'], 'slack');
    this.data = context.dataCollection;
    this.options = options;
  },
  close(options, errors) {

    const slack = new Slack(options.slack.hookUrl);
    let logo = "https://www.sitespeed.io/img/slack/sitespeed-logo-slack.png";

    if (!options.slack.channel.startsWith('#')) {
      options.slack.channel = '#' + options.slack.channel;
    }

    let text = '';
    log.debug('Sending message to Slack channel %s and username %s', options.channel, options.userName);

    if (options.slack.type === 'summary' || options.slack.type === 'both') {
      const sum = summary.get(this.data, options, errors);
      text += sum.summaryText + '\n' + sum.errorText;
      logo = sum.logo;
    }
    let att = [];
    if (options.slack.type === 'url' || options.slack.type === 'both') {
      att = attachements.get(this.data);
    }

    return slack.sendAsync({
      text: text,
      icon_url: logo,
      channel: options.slack.channel,
      mrkdwn: true,
      username: options.slack.userName,
      attachments: att
    })

  }
}
