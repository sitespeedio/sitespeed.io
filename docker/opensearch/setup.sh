#!/usr/bin/env bash
# Apply sitespeed.io index templates to OpenSearch.
# ISM retention policies are created automatically by the sitespeed.io
# OpenSearch plugin on first run (configurable via --opensearch.retentionDays
# and --opensearch.runRetentionDays).
#
# Usage:
#   ./setup.sh                        # connects to http://localhost:9200
#   ./setup.sh http://my-host:9200
#   ./setup.sh http://my-host:9200 user:password

set -e

HOST="${1:-http://localhost:9200}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CURL_OPTS=(-sf -H 'Content-Type: application/json')
if [ -n "$2" ]; then
  CURL_OPTS+=(-u "$2")
fi

echo "Applying sitespeed.io index templates to OpenSearch at $HOST"

for template in pagesummary run pagexray compare coach; do
  echo "  -> sitespeed-${template}"
  curl "${CURL_OPTS[@]}" -X PUT "$HOST/_index_template/sitespeed-${template}" \
    -d @"$DIR/index-template-${template}.json"
  echo
done

echo "Done. Start sitespeed.io with --opensearch.host to activate the plugin."
echo "ISM retention policies will be created on first run."
