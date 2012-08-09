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
DATE=$(date) 
echo "Will crawl from start point $URL with depth $DEPTH ... this can take a while"

# remove the protocol
NOPROTOCOL=${URL#*//}
HOST=${NOPROTOCOL%%/*}
RETRIES=1
index=0

links=$(wget -r -l $DEPTH -nd -t $RETRIES -e robots=off --no-check-certificate --follow-tags=a --spider $USER $PASSWORD $URL 2>&1 | while read line
do
     echo "$line" | grep -E "\-\-\d{4}" | cut -d " " -f 4
done)

result=($(printf '%s\n' "${links[@]}"|sort|uniq))

echo "Fetched ${#result[@]} pages" 

# Setup dirs
REPORT_DIR="sitespeed-result/sitespeed-$HOST-$NOW"
REPORT_DATA_DIR="$REPORT_DIR/data"
REPORT_DATA_PAGES_DIR="$REPORT_DATA_DIR/pages"
mkdir -p $REPORT_DIR
mkdir $REPORT_DATA_DIR
mkdir $REPORT_DATA_PAGES_DIR


echo '<?xml version="1.0" encoding="UTF-8"?><document host="'$HOST'" url="'$URL'" date="'$DATE'">' >> $REPORT_DATA_DIR/result.xml

pagefilename=1
for i in "${result[@]}"
do
    echo "Analyzing $i"
    phantomjs dependencies/yslow.js -f xml "$i" >>"$REPORT_DATA_PAGES_DIR/$pagefilename.xml"
    # Sometimes the yslow script adds output before the xml tag, should probably be reported ...
    sed -i "" '/<?xml/,$!d' $REPORT_DATA_PAGES_DIR/$pagefilename.xml
     
    # Hack for adding link to the output file name
    sed -i "" 's/<results>/<results filename="'$pagefilename'">/g' $REPORT_DATA_PAGES_DIR/$pagefilename.xml 
    cat "$REPORT_DATA_PAGES_DIR/$pagefilename.xml" | cut -c39- >> "$REPORT_DATA_DIR/result.xml"
    pagefilename=$[$pagefilename+1]
done
echo '</document>'>> "$REPORT_DATA_DIR/result.xml"

echo 'Create the pages.html'
java -jar dependencies/xml-velocity-1.0-full.jar $REPORT_DATA_DIR/result.xml report/velocity/pages.vm report/properties/pages.properties $REPORT_DIR/pages.html

echo 'Create the summary: index.html'
java -jar dependencies/xml-velocity-1.0-full.jar $REPORT_DATA_DIR/result.xml report/velocity/summary.vm report/properties/summary.properties $REPORT_DIR/index.html


echo 'Create individual pages'
for file in $REPORT_DATA_PAGES_DIR/*
do
 filename=$(basename -s .xml $file)
 java -jar dependencies/xml-velocity-1.0-full.jar $file report/velocity/page.vm report/properties/page.properties $REPORT_DIR/$filename.html    
done


#copy the rest of the files
mkdir $REPORT_DIR/css
mkdir $REPORT_DIR/js
mkdir $REPORT_DIR/img

cp report/css/* $REPORT_DIR/css
cp report/js/* $REPORT_DIR/js
cp report/img/* $REPORT_DIR/img

echo "Finished, see the report $REPORT_DIR/index.html"
exit 0