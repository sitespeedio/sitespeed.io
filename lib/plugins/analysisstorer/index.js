'use strict';

function shouldIgnoreMessage(message) {
  return (
    [
      'url',
      'error',
      'sitespeedio.summarize',
      'browsertime.screenshot',
      'browsertime.har',
      'webpagetest.har',
      'aggregateassets.summary',
      'slowestassets.summary',
      'largestassets.summary'
    ].indexOf(message.type) >= 0
  );
}

module.exports = {
  open(context) {
    this.storageManager = context.storageManager;
  },
  processMessage(message) {
    if (shouldIgnoreMessage(message)) {
      return;
    }

    const jsonData = JSON.stringify(message.data);

    let fileName = message.type + '.json';

    if (message.url) {
      if (Number.isInteger(message.runIndex)) {
        fileName = message.type + '-' + message.runIndex + '.json';
      }

      return this.storageManager.writeDataForUrl(
        jsonData,
        fileName,
        message.url
      );
    } else {
      if (message.group) {
        fileName = message.type + '-' + message.group + '.json';
      }

      return this.storageManager.writeData(jsonData, fileName);
    }
  }
};
