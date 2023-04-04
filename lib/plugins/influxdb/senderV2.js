import { InfluxDB, Point, HttpError } from '@influxdata/influxdb-client';

export class InfluxDB2Sender {
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
      for (const key of Object.keys(point.tags)) {
        influxPoint.tag(key, point.tags[key]);
      }
      for (const key of Object.keys(point.point)) {
        if (key === 'time') {
          influxPoint.timestamp(new Date(point.point[key]));
        } else {
          influxPoint.floatField(key, point.point[key]);
        }
      }
      points.push(influxPoint);
    }
    this.client.writePoints(points);
    return this.client.flush().catch(error => {
      if (error instanceof HttpError && error.statusCode === 401) {
        throw new Error(
          `The InfluxDB database: ${this.database} doesn't exist.`
        );
      }
      throw new Error('Writing to influx failed');
    });
  }
}
