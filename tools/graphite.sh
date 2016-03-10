#!/bin/bash -e

# Start local Graphite and Grafana instances, for testing Graphite reporting

docker run -d -p 8080:80 -p 2003:2003 sitespeedio/graphite
docker run -d -p 3000:3000 grafana/grafana
