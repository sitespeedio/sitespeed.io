#!/bin/sh

GF_API=${GF_API:-http://grafana:3000/api}

echo "Waiting for Grafana API..."

curl -u admin:admin ${GF_API}/datasources -f &> /dev/null
while [ $? -ne 0 ]; do
  sleep 2
  curl -u admin:admin ${GF_API}/datasources -f &> /dev/null
done

echo "Up!"

echo "Adding datasources..."

for datasource in `ls -1 /datasources/*.json`; do
  echo "Adding ${datasource}"
  curl -s -H 'Content-Type:application/json' -u admin:admin --data @"${datasource}" ${GF_API}/datasources
  echo ""
done

echo "Adding dashboards..."

for dashboard in `ls -1 /dashboards/*.json`; do
  echo "Adding ${dashboard}"
  curl -s -H 'Content-Type:application/json' -u admin:admin --data @"${dashboard}" ${GF_API}/dashboards/db
  echo ""
done

echo "Done!"
