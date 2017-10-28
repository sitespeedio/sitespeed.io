#!/bin/bash
set -e

# Remove the local sitespeed-result dir and node modules to start clean
rm -fR sitespeed-result node_modules

# Generate the help for the docs
bin/sitespeed.js --help > docs/documentation/sitespeed.io/configuration/config.md

# Login early 
docker login

# Super simple release script for sitespeed.io
# Lets use it it for now and make it better over time :)
# You need np for this to work
# npm install --global np
np $1

PACKAGE_VERSION=$(node -e 'console.log(require("./package").version)')

docker build --no-cache -t sitespeedio/sitespeed.io:$PACKAGE_VERSION -t sitespeedio/sitespeed.io:latest .

docker push sitespeedio/sitespeed.io:$PACKAGE_VERSION
docker push sitespeedio/sitespeed.io:latest

# Update to latet version in the docs
bin/sitespeed.js --version > docs/version/sitespeed.io.txt