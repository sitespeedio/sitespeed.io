'use strict';

const elasticsearch = require('elasticsearch');

class ElasticsearchSender {
  constructor(host, port, timestamp) {
    this.timestamp = timestamp;
    this.client = new elasticsearch.Client({
      host: `${host}:${port}`,
      log: 'info'
    });
  }

  send(message) {
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
