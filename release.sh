#!/bin/bash
set -e

# Remove the local sitespeed-result dir and node modules to start clean
rm -fR sitespeed-result

# Super simple release script for sitespeed.io
# Lets use it it for now and make it better over time :)
# You need np for this to work
# npm install --global np
np $* --no-yarn --branch main

# Update to latest version in the docs
bin/sitespeed.js --version | tr -d '\n' > docs/_includes/version/sitespeed.io.txt

# Generate the help for the docs
bin/sitespeed.js --help > docs/documentation/sitespeed.io/configuration/config.md

# Generate friendly names from code
node release/friendlyNames.js > docs/documentation/sitespeed.io/configure-html/friendlynames.md
node release/friendlyNamesBudget.js > docs/documentation/sitespeed.io/performance-budget/friendlynames.md

# Generate the RSS feeds
node release/feed.js