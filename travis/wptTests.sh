#!/bin/bash
set -ev
if [ "${WPTKEY}" != "false" ]; then
  bin/sitespeed.js -b chrome -n 2 --summaryDetail --browsertime.chrome.dumpTraceCategoriesLog https://www.sitespeed.io/ --webpagetest.key $WPTKEY
fi
