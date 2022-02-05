#!/bin/bash
set -e

# Remove the local sitespeed-result dir and node modules to start clean
rm -fR sitespeed-result

# Login early
docker login

# Super simple release script for sitespeed.io
# Lets use it it for now and make it better over time :)
# You need np for this to work
# npm install --global np
np $* --no-yarn --branch main

PACKAGE_VERSION=$(node -e 'console.log(require("./package").version)')

docker buildx build --push --platform linux/arm64,linux/amd64 --no-cache -t sitespeedio/sitespeed.io:$PACKAGE_VERSION -t sitespeedio/sitespeed.io:latest .

docker buildx build --push --platform linux/arm64,linux/amd64 --no-cache -t sitespeedio/sitespeed.io:$PACKAGE_VERSION-slim --file Dockerfile-slim .

docker buildx build --push --platform linux/arm64,linux/amd64 -t sitespeedio/sitespeed.io:$PACKAGE_VERSION-plus1 --build-arg version=$PACKAGE_VERSION --file docker/Dockerfile-plus1 .

docker buildx build --push --platform linux/arm64,linux/amd64 -t sitespeedio/sitespeed.io:$PACKAGE_VERSION-webpagetest --build-arg version=$PACKAGE_VERSION --file docker/Dockerfile-webpagetest .

# Update to latest version in the docs
bin/sitespeed.js --version | tr -d '\n' > docs/_includes/version/sitespeed.io.txt

# Generate the help for the docs
bin/sitespeed.js --help > docs/documentation/sitespeed.io/configuration/config.md

# Generate friendly names from code
node release/friendlyNames.js > docs/documentation/sitespeed.io/configure-html/friendlynames.md
node release/friendlyNamesBudget.js > docs/documentation/sitespeed.io/performance-budget/friendlynames.md

# Generate the RSS feeds
node release/feed.js