#! /bin/bash

#******************************************************
# Sitespeed.io - How speedy is your site?
# 
# Copyright (C) 2012 by Peter Hedenskog (http://peterhedenskog.com)
#
#******************************************************
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in 
# compliance with the License. You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is 
# distributed  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   
# See the License for the specific language governing permissions and limitations under the License.
#
#*******************************************************

if (!command -v phantomjs &> /dev/null) ; then
   echo 'Missing phantomjs, please install it to be able to run sitespeed'
   exit 1;
fi

if [ -z "$1" ]; then
   echo "Missing url. USAGE: ${0} http[s]://host[:port][/path/] [crawl-depth] [username] [password]"
   exit 1;
fi

if [ "$2" != "" ]
then
    DEPTH="$2"
else
    DEPTH="1"
fi

URL="$1"

USER=""
PASSWORD=""

if [[ "$3" != "" && "$4" != "" ]]
then
	USER="--http-user=$3"
	PASSWORD="--http-password=$4"
fi

NOW=$(date +"%Y-%m-%d-%H-%M-%S")
echo "Will crawl from start point $URL with depth $DEPTH ... this can take a while"

# remove the protocol
NOPROTOCOL=${URL#*//}
HOST=${NOPROTOCOL%%/*}
RETRIES=1
index=0

links=$(wget -r -l $DEPTH -nd -t $RETRIES -e robots=off --no-check-certificate --follow-tags=a --spider $USER $PASSWORD $URL 2>&1 | while read line
do
     echo "$line" | grep -P "\-\-\d{4}" | cut -d " " -f 4
done)

result=($(printf '%s\n' "${links[@]}"|sort|uniq))

RESULT_DIR="sitespeed-result"
if [ ! -d $RESULT_DIR ]; then
    mkdir $RESULT_DIR
fi

echo "Will create result file: $RESULT_DIR/sitespeed-$HOST-$NOW.txt"
for i in "${result[@]}"
do
    echo "Analyzing $i"
    phantomjs dependencies/yslow.js $i >> $RESULT_DIR/sitespeed-$HOST-$NOW.txt
done

echo "Finished"