'use strict';

function shouldIgnoreMessage(message) {
  return (
    [
      'url',
      'browsertime.navigationScripts',
      'error',
      'sitespeedio.summarize',
      'sitespeedio.prepareToRender',
      'sitespeedio.render',
      'html.finished',
      'browsertime.har',
      'browsertime.config',
      'browsertime.setup',
      'browsertime.scripts',
      'browsertime.asyncscripts',
      'sitespeedio.setup',
      'webpagetest.har',
      'webpagetest.setup',
      'aggregateassets.summary',
      'slowestassets.summary',
      'largestassets.summary',
      'budget.addMessageType',
      'html.css',
      'html.pug',
      's3.finished',
      'gcs.finished',
      'ftp.finished',
      'graphite.setup',
      'influxdb.setup',
      'grafana.setup',
      'sustainable.setup'
    ].indexOf(message.type) >= 0
  );
}

module.exports = {
  open(context) {
    this.storageManager = context.storageManager;
    this.alias = {};
  },
  processMessage(message) {
    if (shouldIgnoreMessage(message)) {
      return;
    }
    if (message.type === 'browsertime.alias') {
      this.alias[message.url] = message.data;
      return;
    }
    const jsonData = JSON.stringify(message.data);

    let fileName = message.type + '.json';

    if (message.url) {
      if (Number.isInteger(message.iteration)) {
        fileName = message.type + '-' + message.iteration + '.json';
      }

      return this.storageManager.writeDataForUrl(
        jsonData,
        fileName,
        message.url,
        undefined,
        this.alias[message.url]
      );
    } else {
      if (message.group) {
        fileName = message.type + '-' + message.group + '.json';
      }

      return this.storageManager.writeData(jsonData, fileName);
    }
  }
};
