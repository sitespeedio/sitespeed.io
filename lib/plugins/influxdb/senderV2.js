'use strict';

const { InfluxDB, Point, HttpError } = require('@influxdata/influxdb-client');

class InfluxDB2Sender {
  constructor({ protocol, host, port, database, organisation, token }) {
    this.client = new InfluxDB({
      url: `${protocol}://${host}:${port}`,
      token
    }).getWriteApi(organisation, database);
    this.database = database;
  }

  send(data) {
    const points = [];
    for (let point of data) {
      const influxPoint = new Point(point.seriesName);
      Object.keys(point.tags).forEach(key => {
        influxPoint.tag(key, point.tags[key]);
      });
      Object.keys(point.point).forEach(key => {
        if (key === 'time') {
          influxPoint.timestamp(new Date(point.point[key]));
        } else {
          influxPoint.floatField(key, point.point[key]);
        }
      });
      points.push(influxPoint);
    }
    this.client.writePoints(points);
    return this.client.flush().catch(e => {
      if (e instanceof HttpError && e.statusCode === 401) {
        throw new Error(
          `The InfluxDB database: ${this.database} doesn't exist.`
        );
      }
      throw new Error('Writing to influx failed');
    });
  }
}

module.exports = InfluxDB2Sender;
