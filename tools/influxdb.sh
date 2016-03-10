#!/bin/bash -e

# Start local InfluxDB and Grafana instances, for testing InfluxDB reporting
#  -e ADMIN_USER="root" -e INFLUXDB_INIT_PWD="root"
docker run -d -p 8083:8083 -p 8086:8086 --expose 8090 --expose 8099 -e PRE_CREATE_DB="sitespeed" tutum/influxdb
docker run -d -p 3000:3000 grafana/grafana
