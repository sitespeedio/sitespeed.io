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

  send(data) {
    log.info('Send data to Elasticsearch %s:%s', this.host, this.port);
    log.info('Sending ' + data);
    return this.client.create({
        index: `sitespeed-${this.timestamp.format("YYYY.MM.DD")}-${message.type.toLowerCase()}`,
        type: message.type.toLowerCase(),
        id: message.uuid,
        timestamp: this.timestamp.toDate(),
        body: message
    });
  }
}

module.exports = ElasticsearchSender;
