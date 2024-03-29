import { InfluxDB } from 'influx';

export class InfluxDBSender {
  constructor({ protocol, host, port, database, username, password }) {
    this.client = new InfluxDB({
      protocol,
      host,
      port,
      database,
      username,
      password
    });
  }

  send(data) {
    const points = [];
    for (let point of data) {
      points.push({
        tags: point.tags,
        measurement: point.seriesName,
        fields: point.point
      });
    }
    return this.client.writePoints(points);
  }
}
