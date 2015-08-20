#!/bin/sh
set -e
# check to see if phantomjs folder is empty
if [ ! -d "$HOME/phantomjs/bin" ]; then
 wget https://s3.amazonaws.com/travis-phantomjs/phantomjs-2.0.0-ubuntu-12.04.tar.bz2
 tar -xjf phantomjs-2.0.0-ubuntu-12.04.tar.bz2
 mkdir -p $HOME/phantomjs/bin
 mv phantomjs $HOME/phantomjs/bin
else
  echo "Using cached directory."
fi