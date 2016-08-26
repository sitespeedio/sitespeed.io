#!/usr/bin/env bash

docker build ./node/ --tag sitespeed-node
docker build ./visualmetrics/ --tag sitespeed-visualmetrics
docker build ./browsers/ --tag sitespeed-browsers
docker build .. --tag sitespeed-app
