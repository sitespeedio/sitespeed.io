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
np $* --no-yarn

PACKAGE_VERSION=$(node -e 'console.log(require("./package").version)')

docker build --no-cache -t sitespeedio/sitespeed.io:$PACKAGE_VERSION -t sitespeedio/sitespeed.io:latest .
docker push sitespeedio/sitespeed.io:$PACKAGE_VERSION
docker push sitespeedio/sitespeed.io:latest

docker build -t sitespeedio/sitespeed.io:$PACKAGE_VERSION-action --build-arg version=$PACKAGE_VERSION --file docker/github-action/Dockerfile .
docker push sitespeedio/sitespeed.io:$PACKAGE_VERSION-action

docker build -t sitespeedio/sitespeed.io:$PACKAGE_VERSION-plus1 --build-arg version=$PACKAGE_VERSION --file docker/Dockerfile-plus1 .
docker push sitespeedio/sitespeed.io:$PACKAGE_VERSION-plus1

# Update to latet version in the docs
bin/sitespeed.js --version | tr -d '\n' > docs/_includes/version/sitespeed.io.txt

# Generate the help for the docs
bin/sitespeed.js --help > docs/documentation/sitespeed.io/configuration/config.md


