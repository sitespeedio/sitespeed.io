#!/bin/bash
set -e

# Remove the local sitespeed-result dir and node modules to start clean
rm -fR sitespeed-result

# Super simple release script for sitespeed.io
# Lets use it it for now and make it better over time :)
# You need np for this to work
# npm install --global np
np $* --branch main

# Capture the just-released version once so docs, metadata and any
# downstream catalogue file all see the same number.
VERSION="$(bin/sitespeed.js --version | tr -d '\n')"

# Update to latest version in the docs
printf '%s' "$VERSION" > docs/_includes/version/sitespeed.io.txt

# Keep publiccode.yml in sync — softwareVersion and releaseDate are read by
# public-software catalogues, so a stale entry there silently misrepresents
# the project. sed -i.bak + rm keeps this portable between BSD and GNU sed.
if [ -f publiccode.yml ]; then
  TODAY="$(date -u +%Y-%m-%d)"
  sed -i.bak \
    -e "s/^softwareVersion: .*/softwareVersion: \"${VERSION}\"/" \
    -e "s/^releaseDate: .*/releaseDate: \"${TODAY}\"/" \
    publiccode.yml
  rm -f publiccode.yml.bak
fi

# Generate the help for the docs (use --help-all so the published
# reference still lists every option; the plain --help is now a curated
# subset intended for interactive use).
bin/sitespeed.js --help-all > docs/documentation/sitespeed.io/configuration/config.md

# If an onlinetest checkout sits next to us at ../onlinetest, regenerate its
# CLI help JSON so the picker in onlinetest's "command line" tab stays in sync
# with this newly published sitespeed.io version. Skipped if the script
# isn't there (older onlinetest checkouts).
if [ -d "../onlinetest" ] && [ -f "../onlinetest/release/update-cli-help.cjs" ]; then
  echo "Updating onlinetest CLI help…"
  bin/sitespeed.js --help-all | node ../onlinetest/release/update-cli-help.cjs -
  echo "  Remember to commit & push ../onlinetest/server/public/sitespeed-help.json"
fi

# Generate friendly names from code
node release/friendlyNames.js > docs/documentation/sitespeed.io/configure-html/friendlynames.md
node release/friendlyNamesBudget.js > docs/documentation/sitespeed.io/performance-budget/friendlynames.md

# Generate the RSS feeds
node release/feed.js