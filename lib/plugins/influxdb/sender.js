'use strict';

const Influx = require('influx'),
  Promise = require('bluebird');

class InfluxDBSender {
  constructor({ protocol, host, port, database, username, password }) {
    this.client = new Influx.InfluxDB({
      protocol,
      host,
      port,
      database,
      username,
      password
    });
  }

  send(data) {
    return Promise.resolve(data)
      .map(point => {
        return {
          tags: point.tags,
          measurement: point.seriesName,
          fields: point.point
        };
      })
      .then(points => this.client.writePoints(points));
  }
}

module.exports = InfluxDBSender;
