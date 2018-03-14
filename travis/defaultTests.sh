#!/bin/bash
set -ev
npm run travis
npm run build:css && test -z "$(git status --porcelain lib/plugins/html/assets/css/index.css)"
bin/sitespeed.js -b firefox -n 2 --budget.configPath test/budget.json --summary https://www.sitespeed.io/
bin/sitespeed.js -b chrome -n 2 https://www.sitespeed.io/ --preScript test/prepostscripts/preSample.js --postScript test/prepostscripts/postSample.js
node test/runWithoutCli.js
