#!/bin/sh

# Just a fun way to compare how much code is in the project, find the largest files etc.

echo 'Unique LOC js'
find lib -name "*.js" -not -name yslow-3.1.8-sitespeed.js | xargs cat | sort | uniq | wc -l

echo 'Total LOC js'
find lib -name "*.js" -not -name yslow-3.1.8-sitespeed.js | xargs wc -l | sort -r

echo 'Unique LOC jade'
find lib -name "*.pug" | xargs cat | sort | uniq | wc -l

echo 'Total LOC jade'
find lib -name "*.pug" | xargs wc -l | sort -r
