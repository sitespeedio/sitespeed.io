'use strict';

var influx = require('influx'),
  Promise = require('bluebird');

Promise.promisifyAll(influx.InfluxDB.prototype);

class InfluxDBSender {
  constructor(options) {
    this.client = influx(options);
    this.client.setRequestTimeout(1000); // No infinite waits
  }

  send(data) {
    return Promise.resolve(data)
      .each((point) => this.client.writePointAsync(point.seriesName, point.point, {}));
  }
}

module.exports = InfluxDBSender;
