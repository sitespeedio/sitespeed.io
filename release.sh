#!/bin/bash
set -e
# Super simple release script for sitespeed.io
# Lets use it it for now and make it better over time :)
# You need np for this to work
# npm install --global np
np $1

PACKAGE_VERSION=$(node -e 'console.log(require("./package").version)')

docker build --no-cache -t sitespeedio/sitespeed.io:$PACKAGE_VERSION -t sitespeedio/sitespeed.io:latest .

docker login

docker push sitespeedio/sitespeed.io:$PACKAGE_VERSION
docker push sitespeedio/sitespeed.io:latest
