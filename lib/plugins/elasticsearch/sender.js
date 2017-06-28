'use strict';

const elasticsearch = require('elasticsearch'),
  log = require('intel').getLogger('sitespeedio.plugin.elasticsearch');

class ElasticsearchSender {
  constructor(host, port, timestamp, increaseFieldLimit, fieldLimit) {
    this.host = host;
    this.port = port;
    this.timestamp = timestamp;
    this.increaseFieldLimit = increaseFieldLimit;
    this.fieldLimit = fieldLimit;
    this.client = new elasticsearch.Client({
      host: `${host}:${port}`,
      log: 'info'
    });
  }

  send(message) {
    log.info('Send data to Elasticsearch %s:%s', this.host, this.port);
    log.debug('Message: %s', message);
    let index = `sitespeed-${this.timestamp.format("YYYY.MM.DD")}-${message.type.toLowerCase()}`;

    if (this.increaseFieldLimit) {
        if (!this.client.indices.exists({index: index})) {
            this.client.indices.create({
                index: index,
                body: `{"index.mapping.total_fields.limit": ${this.fieldLimit}}`
            });
        } else {
            this.client.indices.putSettings({
                index: index,
                body: `{"index.mapping.total_fields.limit": ${this.fieldLimit}}`
            });
        }
    }
    return this.client.create({
        index: index,
        type: message.type.toLowerCase(),
        id: message.uuid,
        timeout: "50000ms",
        timestamp: new Date(message.timestamp),
        body: message
    });
  }
}

module.exports = ElasticsearchSender;
