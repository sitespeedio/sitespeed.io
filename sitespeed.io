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
   echo "Missing url. USAGE: ${0} http[s]://host[:port][/path/] [crawl-depth] [follow-path]"
   exit 1;
fi

# Switch to my dir
cd "$(dirname ${BASH_SOURCE[0]})"

if [ "$2" != "" ]
then
    DEPTH="$2"
else
    DEPTH="1"
fi

# Check if we should follow a specific path
if [ "$3" != "" ]
then
    FOLLOW_PATH="-p $3"
else
    FOLLOW_PATH=""
fi

URL="$1"

USER=""
PASSWORD=""

NOW=$(date +"%Y-%m-%d-%H-%M-%S")
DATE=$(date) 
echo "Will crawl from start point $URL with depth $DEPTH $FOLLOW_PATH ... this can take a while"


# remove the protocol                                                                                                                                                            
NOPROTOCOL=${URL#*//}
HOST=${NOPROTOCOL%%/*}

# Setup dirs                                                                                                                                                                    
REPORT_DIR="sitespeed-result/sitespeed-$HOST-$NOW"
REPORT_DATA_DIR="$REPORT_DIR/data"
REPORT_PAGES_DIR="$REPORT_DIR/pages"
REPORT_DATA_PAGES_DIR="$REPORT_DATA_DIR/pages"
mkdir -p $REPORT_DIR
mkdir $REPORT_DATA_DIR
mkdir $REPORT_PAGES_DIR
mkdir $REPORT_DATA_PAGES_DIR

java -Xmx256m -Xms256m -cp dependencies/crawler-0.9-full.jar com.soulgalore.crawler.run.CrawlToFile -u $URL -l $DEPTH $FOLLOW_PATH -f $REPORT_DATA_DIR/urls.txt -ef $REPORT_DATA_DIR/nonworkingurls.txt

# read the urls
result=()
while read txt ; do
   result[${#result[@]}]=$txt
done < $REPORT_DATA_DIR/urls.txt

echo "Fetched ${#result[@]} pages" 

if  [ ${#result[@]} == 0 ]
then
exit 0
fi


echo '<?xml version="1.0" encoding="UTF-8"?><document host="'$HOST'" url="'$URL'" date="'$DATE'">' > $REPORT_DATA_DIR/result.xml

pagefilename=1
for i in "${result[@]}"
do
    echo "Analyzing $i"
    phantomjs dependencies/yslow-3.1.4-sitespeed.js -r sitespeed.io -f xml "$i" >"$REPORT_DATA_PAGES_DIR/$pagefilename.xml" || exit 1
 
    # Sometimes the yslow script adds output before the xml tag, should probably be reported ...
    sed '/<?xml/,$!d' $REPORT_DATA_PAGES_DIR/$pagefilename.xml > $REPORT_DATA_PAGES_DIR/bup  ||exit 1
  
    # And crazy enough, sometimes we get things after the end of the xml
    sed -n '1,/<\/results>/p' $REPORT_DATA_PAGES_DIR/bup > $REPORT_DATA_PAGES_DIR/$pagefilename.xml || exit 1
 
    # Hack for adding link to the output file name
    sed 's/<results>/<results filename="'$pagefilename'">/g' $REPORT_DATA_PAGES_DIR/$pagefilename.xml > $REPORT_DATA_PAGES_DIR/bup || exit 1
    mv $REPORT_DATA_PAGES_DIR/bup $REPORT_DATA_PAGES_DIR/$pagefilename.xml
 
    sed 's/<?xml version="1.0" encoding="UTF-8"?>//g' "$REPORT_DATA_PAGES_DIR/$pagefilename.xml" >> "$REPORT_DATA_DIR/result.xml" || exit 1

    java -Xmx256m -Xms256m -jar dependencies/xml-velocity-1.1-full.jar $REPORT_DATA_PAGES_DIR/$pagefilename.xml report/velocity/page.vm report/properties/page.properties $REPORT_PAGES_DIR/$pagefilename.html || exit 1    

    pagefilename=$[$pagefilename+1]
done
echo '</document>'>> "$REPORT_DATA_DIR/result.xml"

echo 'Create the pages.html'
java -Xmx1024m -Xms1024m -jar dependencies/xml-velocity-1.1-full.jar $REPORT_DATA_DIR/result.xml report/velocity/pages.vm report/properties/pages.properties $REPORT_DIR/pages.html || exit 1

echo 'Create the summary index.html'
java -Xmx1024m -Xms1024m -jar dependencies/xml-velocity-1.1-full.jar $REPORT_DATA_DIR/result.xml report/velocity/summary.vm report/properties/summary.properties $REPORT_DIR/index.html || exit 1

#copy the rest of the files
mkdir $REPORT_DIR/css
mkdir $REPORT_DIR/js
mkdir $REPORT_DIR/img

cp report/css/* $REPORT_DIR/css
cp report/js/* $REPORT_DIR/js
cp report/img/* $REPORT_DIR/img

echo 'Create summary png:s'
# create images, easy to use in reports etc
phantomjs dependencies/rasterize.js $REPORT_DIR/index.html $REPORT_DIR/summary.png
phantomjs dependencies/rasterize.js $REPORT_DIR/pages.html $REPORT_DIR/pages.png


echo "Finished, see the report $REPORT_DIR/index.html"
exit 0