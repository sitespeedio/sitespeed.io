'use strict';

let throwIfMissing = require('../../support/util').throwIfMissing,
  Promise = require('bluebird'),
  path = require('path'),
  merge = require('lodash.merge'),
  Slack = require('node-slack');

Promise.promisifyAll(Slack.prototype);

const defaultOptions = {
  channel: '#general'
};

module.exports = {
  name() { return path.basename(__dirname); },
  open(context, options) {
    throwIfMissing(options.slack, ['hookUrl', 'userName'], 'slack');

    this.options = merge({}, defaultOptions, options.slack);
    this.slack = new Slack(this.options.hookUrl);

    if (!this.options.channel.startsWith('#'))
      this.options.channel = '#' + this.options.channel;
  },
  close() {
    return this.slack.sendAsync({
      text: 'Sitespeed done!',
      channel: this.options.channel,
      username: this.options.userName
    });
  }
};
