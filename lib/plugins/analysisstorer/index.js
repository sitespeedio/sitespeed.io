import { SitespeedioPlugin } from '@sitespeed.io/plugin';

function shouldIgnoreMessage(message) {
  return [
    'url',
    'browsertime.navigationScripts',
    'error',
    'sitespeedio.summarize',
    'sitespeedio.prepareToRender',
    'sitespeedio.render',
    'html.finished',
    'axe.setup',
    'browsertime.har',
    'browsertime.config',
    'browsertime.setup',
    'browsertime.scripts',
    'browsertime.asyncscripts',
    'compare.setup',
    'sitespeedio.setup',
    'aggregateassets.summary',
    'slowestassets.summary',
    'largestassets.summary',
    'budget.addMessageType',
    'html.css',
    'html.pug',
    's3.setup',
    's3.finished',
    'scp.setup',
    'scp.finished',
    'gcs.setup',
    'gcs.finished',
    'ftp.setup',
    'ftp.finished',
    'graphite.setup',
    'influxdb.setup',
    'grafana.setup',
    'sustainable.setup'
  ].includes(message.type);
}

export default class AnalysisstorerPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'analysisstorer', options, context, queue });
  }

  open(context) {
    this.storageManager = context.storageManager;
    this.alias = {};
  }
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
}
