'use strict';

let throwIfMissing = require('../../support/util').throwIfMissing,
  Promise = require('bluebird'),
  path = require('path'),
  util = require('util'),
  merge = require('lodash.merge'),
  Slack = require('node-slack');

Promise.promisifyAll(Slack.prototype);

const defaultOptions = {
  channel: '#general'
};

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    throwIfMissing(options.slack, ['hookUrl', 'userName'], 'slack');
  },
  close(errors, options) {
    options = merge({}, defaultOptions, options.slack);
    const slack = new Slack(options.hookUrl);

    if (!options.channel.startsWith('#'))
      options.channel = '#' + options.channel;

    let text = 'Sitespeed done!';
    if (errors.length > 0)
      text += util.format(' (%d) errors', errors.length);

    return slack.sendAsync({
      text: text,
      channel: options.channel,
      username: options.userName
    });
  }
};
