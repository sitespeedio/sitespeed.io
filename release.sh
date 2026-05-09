#!/bin/bash
set -e

# Remove the local sitespeed-result dir and node modules to start clean
rm -fR sitespeed-result

# Super simple release script for sitespeed.io
# Lets use it it for now and make it better over time :)
# You need np for this to work
# npm install --global np
np $* --branch main

# Update to latest version in the docs
bin/sitespeed.js --version | tr -d '\n' > docs/_includes/version/sitespeed.io.txt

# Generate the help for the docs
bin/sitespeed.js --help > docs/documentation/sitespeed.io/configuration/config.md

# If an onlinetest checkout sits next to us at ../onlinetest, regenerate its
# CLI help JSON so the picker in onlinetest's "command line" tab stays in sync
# with this newly published sitespeed.io version. Skipped if the script
# isn't there (older onlinetest checkouts).
if [ -d "../onlinetest" ] && [ -f "../onlinetest/release/update-cli-help.cjs" ]; then
  echo "Updating onlinetest CLI help…"
  bin/sitespeed.js --help | node ../onlinetest/release/update-cli-help.cjs -
  echo "  Remember to commit & push ../onlinetest/server/public/sitespeed-help.json"
fi

# Generate friendly names from code
node release/friendlyNames.js > docs/documentation/sitespeed.io/configure-html/friendlynames.md
node release/friendlyNamesBudget.js > docs/documentation/sitespeed.io/performance-budget/friendlynames.md

# Generate the RSS feeds
node release/feed.js