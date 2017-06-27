'use strict';

const elasticsearch = require('elasticsearch'),
  log = require('intel').getLogger('sitespeedio.plugin.elasticsearch');

class ElasticsearchSender {
  constructor(host, port, timestamp) {
    this.host = host;
    this.port = port;
    this.timestamp = timestamp;
    this.client = new elasticsearch.Client({
      host: `${host}:${port}`,
      log: 'info'
    });
  }

  send(message) {
    log.info('Send data to Elasticsearch %s:%s', this.host, this.port);
    log.debug('Message: %s', message);
    return this.client.create({
        index: `sitespeed-${this.timestamp.format("YYYY.MM.DD")}-${message.type.toLowerCase()}`,
        type: message.type.toLowerCase(),
        id: message.uuid,
        timestamp: new Date(message.timestamp),
        body: message
    });
  }
}

module.exports = ElasticsearchSender;
