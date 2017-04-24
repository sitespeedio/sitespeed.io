# Local development with Docker Compose

## Bring it up!
Start containers with Graphite, InfluxDB and Graphite.
Bootstrap Grafana with data sources for Influx and Grafana, and set up dashboards.
Build a local Docker container with Sitespeed.io built from local sources.

Only the Grafana GUI on port 3000 is exposed to localhost.
InfluxDB and Graphite run only on a Docker internal network.
```
docker-compose up -d --build
```
Dashboards are read from grafana-setup/dashboards. The grafana db is hosted on a separate Docker volume
that has to be deleted separately if needed (see the Docker documentation).

TODO: Serving result pages from sitespeed-results via a web server is not yet functional.

## Update dashboards
After making changes to dashboards from grafana-setup/dashboards,
run the following to push the updated dashboards to Grafana.
```
docker-compose up --build grafana-setup
```

## Shutdown and remove containers

When you are done you can shutdown and remove all the docker containers by running `docker-compose stop && docker-compose rm`

NOTE: This will close and remove all containers but the data will not be removed. To remove the Graphite and Grafana data volumes and start from scratch you need to run `docker volume rm performancedashboard_graphite performancedashboard_grafana`.

## Run Sitespeed.io
The local Sitespeed.io container with Linux making it easy to record videos.

Other containers (such as graphite) can be referenced via name on the Docker internal network
as in the following example.

```
docker-compose build sitespeed
docker-compose run sitespeed http://www.sitespeed.io --graphite.host=graphite
```

If you want to send data to influxdb:

```
docker-compose run sitespeed http://www.idg.se --influxdb.host=influxdb --influxdb.database sitespeedio -n 1
```
