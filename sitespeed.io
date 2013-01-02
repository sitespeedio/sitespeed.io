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

command -v phantomjs >/dev/null 2>&1 || { echo >&2 "Missing phantomjs, please install it to be able to run sitespeed.io"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo >&2 "Missing curl, please install it to be able to run sitespeed.io"; exit 1; }


#*******************************************************
# Help function, call it to print all different usages.
#
#*******************************************************
help()
{
cat << EOF
usage: $0 options

Sitespeed is a tool that helps you analyze your website performance and show you what you should optimize, more info at http://sitespeed.io

OPTIONS:
   -h      Help
   -u      The start url for the test: http[s]://host[:port][/path/]
   -d      The crawl depth, default is 1 [optional]
   -f      Crawl only on this path [optional]
   -s      Skip urls that contains this in the path [optional]
   -p      The number of processes that will analyze pages, default is 5 [optional]
   -m      The memory heap size for the java applications, default is 1024 kb [optional]
   -o      The output format, always output as html but you can add images and/or csv (img,csv) [optional]
   -r      The result base directory, default is sitespeed-result [optional]
   -z      Create a tar zip file of the result files, default is false [optional]
   -x      The proxy host & protocol: proxy.soulgalore.com:80 [optional] 
   -t      The proxy type, default is http [optional]
   -a      The user agent, default is "Mozilla/6.0" [optional]
   -v      The view port, the page viewport size WidthxHeight, like 400x300, default is 1280x800 [optional]  
EOF
}

#*******************************************************
# Analyze function, call it to analyze a page
# $1 the url to analyze
# $2 the filename of that tested page
#*******************************************************
analyze() {
    # setup the parameters, same names maybe makes it easier
    url=$1
    pagefilename=$2
  
    echo "Analyzing $url"
    phantomjs $PROXY_PHANTOMJS dependencies/yslow-3.1.4-sitespeed.js -d -r sitespeed.io-1.5 -f xml $USER_AGENT_YSLOW $VIEWPORT_YSLOW "$url" >"$REPORT_DATA_PAGES_DIR/$pagefilename.xml" || exit 1
 
    # Sometimes the yslow script adds output before the xml tag, should probably be reported ...
    sed '/<?xml/,$!d' $REPORT_DATA_PAGES_DIR/$pagefilename.xml > $REPORT_DATA_PAGES_DIR/$pagefilename-bup  || exit 1
  
    # And crazy enough, sometimes we get things after the end of the xml
    sed -n '1,/<\/results>/p' $REPORT_DATA_PAGES_DIR/$pagefilename-bup > $REPORT_DATA_PAGES_DIR/$pagefilename.xml || exit 1
 
    # ttfb & page size
    curl $USER_AGENT_CURL --compressed -o /dev/null -w "%{time_starttransfer};%{size_download}\n" -s $url >  "$REPORT_DATA_PAGES_DIR/$pagefilename.info"
    
    read -r TTFB_SIZE <  $REPORT_DATA_PAGES_DIR/$pagefilename.info
    TTFB="$(echo $TTFB_SIZE  | cut -d \; -f 1)"
    SIZE="$(echo $TTFB_SIZE  | cut -d \; -f 2)"
    TTFB="$(printf "%.3f" $TTFB)"
  
    rm "$REPORT_DATA_PAGES_DIR/$pagefilename.info"
    # Hack for adding link and other data to the xml file
    XML_URL=$(echo "$url" | sed 's/&/\\&/g') 
  
    sed 's@<results>@<results filename="'$pagefilename'" ttfb="'$TTFB'" size="'$SIZE'"><curl><![CDATA['$XML_URL']]></curl>@' $REPORT_DATA_PAGES_DIR/$pagefilename.xml > $REPORT_DATA_PAGES_DIR/$pagefilename-bup || exit 1
    mv $REPORT_DATA_PAGES_DIR/$pagefilename-bup $REPORT_DATA_PAGES_DIR/$pagefilename.xml 
   
    $JAVA -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_PAGES_DIR/$pagefilename.xml $VELOCITY_DIR/page.vm $PROPERTIES_DIR/page.properties $REPORT_PAGES_DIR/$pagefilename.html || exit 1
    $JAVA -jar $DEPENDENCIES_DIR/$HTMLCOMPRESSOR_JAR --type html --compress-css --compress-js -o $REPORT_PAGES_DIR/$pagefilename.html $REPORT_PAGES_DIR/$pagefilename.html
   
}

# All the options that you can configure when you run the script
URL=
DEPTH=1
FOLLOW_PATH=
NOT_IN_URL=
MAX_PROCESSES=5
OUTPUT_FORMAT=
JAVA_HEAP=1024
REPORT_BASE_DIR=
CREATE_TAR_ZIP=false
PROXY_HOST=
PROXY_TYPE=http

PROXY_PHANTOMJS=
PROXY_CRAWLER=

USER_AGENT="Mozilla/6.0"
USER_AGENT_YSLOW=
USER_AGENT_CRAWLER=
USER_AGENT_CURL=

VIEWPORT=1280x800
VIEWPORT_YSLOW=

# Set options
while getopts “hu:d:f:s:o:m:p:r:z:x:t:a:v:” OPTION
do
     case $OPTION in
         h)
             help
             exit 1
             ;;
         u)URL=$OPTARG;;
         d)DEPTH=$OPTARG;;
         f)FOLLOW_PATH=$OPTARG;;
         s)NOT_IN_URL=$OPTARG;;   
         o)OUTPUT_FORMAT=$OPTARG;;  
         m)JAVA_HEAP==$OPTARG;;  
         p)MAX_PROCESSES=$OPTARG;;
         r)REPORT_BASE_DIR=$OPTARG;;
         z)CREATE_TAR_ZIP=$OPTARG;;
         x)PROXY_HOST=$OPTARG;;
         t)PROXY_TYPE=$OPTARG;;
         a)USER_AGENT=$OPTARG;;
         v)VIEWPORT=$OPTARG;;
         ?)
             help
             exit
             ;;
     esac
done

# Verify that all options needed exists & set default values for missing ones

if [[ -z $URL ]] 
then
     help
     exit 1
fi

if [ "$FOLLOW_PATH" != "" ]
then
    FOLLOW_PATH="-p $FOLLOW_PATH"
else
    FOLLOW_PATH=""
fi

if [ "$NOT_IN_URL" != "" ]
then
    NOT_IN_URL="-np $NOT_IN_URL"
else
    NOT_IN_URL=""
fi

if [[ "$OUTPUT_FORMAT" == *csv* ]]
  then 
  OUTPUT_CSV=true
else
   OUTPUT_CSV=false
fi  

if [[ "$OUTPUT_FORMAT" == *img* ]]
  then 
  OUTPUT_IMAGES=true
else
   OUTPUT_IMAGES=false
fi  

if [[ -z $OUTPUT_IMAGES ]] 
  then
  OUTPUT_IMAGES=false
fi

if [[ -z $REPORT_BASE_DIR ]] 
then
     REPORT_BASE_DIR="sitespeed-result"
fi

if [ "$PROXY_HOST" != "" ]
then
    PROXY_PHANTOMJS="--proxy=$PROXY_HOST --proxy-type=$PROXY_TYPE"
    PROXY_CRAWLER="-Dcom.soulgalore.crawler.proxy=$PROXY_TYPE":"$PROXY_HOST"
fi

if [ "$USER_AGENT" != "" ]
then
    USER_AGENT_YSLOW="--ua $USER_AGENT"
    USER_AGENT_CRAWLER="-rh User-Agent:$USER_AGENT"
    USER_AGENT_CURL="--user-agent $USER_AGENT"
fi

if [ "$VIEWPORT" != "" ]
then
    VIEWPORT_YSLOW="-vp $VIEWPORT"
fi


# Finished verify the input

# Respect JAVA_HOME if set
if [[ -n "$JAVA_HOME" ]] && [[ -x "$JAVA_HOME/bin/java" ]]
then
    JAVA="$JAVA_HOME/bin/java"
else
    JAVA="java"
fi

# Switch to my dir
cd "$(dirname ${BASH_SOURCE[0]})"

NOW=$(date +"%Y-%m-%d-%H-%M-%S")
DATE=$(date) 

echo "Will crawl from start point $URL with depth $DEPTH $FOLLOW_PATH $NOT_IN_URL ... this can take a while"

# remove the protocol                                                                                                                                                            
NOPROTOCOL=${URL#*//}
HOST=${NOPROTOCOL%%/*}

# Jar files
CRAWLER_JAR=crawler-1.3-full.jar
VELOCITY_JAR=xml-velocity-1.3-full.jar
HTMLCOMPRESSOR_JAR=htmlcompressor-1.5.3.jar

# Setup dirs                                                                                                                                                             
DEPENDENCIES_DIR="dependencies"
REPORT_DIR_NAME=sitespeed-$HOST-$NOW
REPORT_DIR=$REPORT_BASE_DIR/$REPORT_DIR_NAME
REPORT_DATA_DIR=$REPORT_DIR/data
REPORT_PAGES_DIR=$REPORT_DIR/pages
REPORT_DATA_PAGES_DIR=$REPORT_DATA_DIR/pages
REPORT_IMAGE_PAGES_DIR=$REPORT_DIR/images
VELOCITY_DIR=report/velocity
PROPERTIES_DIR=report/properties

mkdir -p $REPORT_DIR
mkdir $REPORT_DATA_DIR
mkdir $REPORT_PAGES_DIR
mkdir $REPORT_DATA_PAGES_DIR
if $OUTPUT_IMAGES 
  then
  mkdir $REPORT_IMAGE_PAGES_DIR
fi

$JAVA -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -Dcom.soulgalore.crawler.propertydir=$DEPENDENCIES_DIR/ $PROXY_CRAWLER -cp $DEPENDENCIES_DIR/$CRAWLER_JAR com.soulgalore.crawler.run.CrawlToFile -u $URL -l $DEPTH $FOLLOW_PATH $NOT_IN_URL $USER_AGENT_CRAWLER -f $REPORT_DATA_DIR/urls.txt -ef $REPORT_DATA_DIR/errorurls.txt

if [ ! -e $REPORT_DATA_DIR/urls.txt ];
then
echo "No url:s were fetched"
exit 0
fi

# read the urls
result=()
while read txt ; do
   result[${#result[@]}]=$txt
done < $REPORT_DATA_DIR/urls.txt

echo "Fetched ${#result[@]} pages" 

# Setup start parameters, 0 jobs are running and the first file name
JOBS=0
PAGEFILENAME=1

for page in "${result[@]}"
do analyze $page $PAGEFILENAME &
    PAGEFILENAME=$[$PAGEFILENAME+1]
    JOBS=$[$JOBS+1]
    if [ "$JOBS" -ge "$MAX_PROCESSES" ]
	   then
	   wait
	   JOBS=0
    fi
done

# make sure all processes has finished
wait

# take care of error urls
if [ -e $REPORT_DATA_DIR/errorurls.txt ];
then
  resultError=()
  while read txt ; do
    resultError[${#resultError[@]}]=$txt
  done < $REPORT_DATA_DIR/errorurls.txt

  echo '<?xml version="1.0" encoding="UTF-8"?><results>'  > $REPORT_DATA_DIR/errorurls.xml
  for url in "${resultError[@]}"
    do echo "<url reason='${url/,*/ }'>${url/*,/ }</url>" >> $REPORT_DATA_DIR/errorurls.xml
  done
  echo '</results>' >> $REPORT_DATA_DIR/errorurls.xml
  echo 'Create the errorurls.html'
  $JAVA -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_DIR/errorurls.xml $VELOCITY_DIR/errorurls.vm $PROPERTIES_DIR/errorurls.properties $REPORT_DIR/errorurls.html || exit 1
  $JAVA -jar $DEPENDENCIES_DIR/$HTMLCOMPRESSOR_JAR --type html --compress-css --compress-js -o $REPORT_DIR/errorurls.html $REPORT_DIR/errorurls.html

fi

echo "Create result.xml"
 
echo '<?xml version="1.0" encoding="UTF-8"?><document host="'$HOST'" date="'$DATE'" useragent="'$USER_AGENT'" viewport="'$VIEWPORT'"><url><![CDATA['$URL']]></url>' > $REPORT_DATA_DIR/result.xml
for file in $REPORT_DATA_PAGES_DIR/*
do
  # Hack for removing dictonaries in the result file
  sed 's@<dictionary>.*@</results>@' "$file" > $REPORT_DATA_DIR/tmp.txt || exit 1
  sed 's/<?xml version="1.0" encoding="UTF-8"?>//g' "$REPORT_DATA_DIR/tmp.txt" >> "$REPORT_DATA_DIR/result.xml" || exit 1
  rm "$REPORT_DATA_DIR/tmp.txt"

done 
echo '</document>'>> "$REPORT_DATA_DIR/result.xml"

echo 'Create the pages.html'
$JAVA -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_DIR/result.xml $VELOCITY_DIR/pages.vm $PROPERTIES_DIR/pages.properties $REPORT_DIR/pages.html || exit 1
$JAVA -jar $DEPENDENCIES_DIR/$HTMLCOMPRESSOR_JAR --type html --compress-css --compress-js -o $REPORT_DIR/pages.html $REPORT_DIR/pages.html


echo 'Create the summary index.html'
$JAVA -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_DIR/result.xml $VELOCITY_DIR/summary.vm $PROPERTIES_DIR/summary.properties $REPORT_DIR/index.html || exit 1
$JAVA -jar $DEPENDENCIES_DIR/$HTMLCOMPRESSOR_JAR --type html --compress-css --compress-js -o $REPORT_DIR/index.html $REPORT_DIR/index.html

echo 'Create the rules.html'
$JAVA -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_PAGES_DIR/1.xml $VELOCITY_DIR/rules.vm $PROPERTIES_DIR/rules.properties $REPORT_DIR/rules.html || exit 1
$JAVA -jar $DEPENDENCIES_DIR/$HTMLCOMPRESSOR_JAR --type html --compress-css --compress-js -o $REPORT_DIR/rules.html $REPORT_DIR/rules.html

#copy the rest of the files
mkdir $REPORT_DIR/css
mkdir $REPORT_DIR/js
mkdir $REPORT_DIR/img

cat "$BASE_DIR"report/css/bootstrap.min.css > $REPORT_DIR/css/styles.css
cat "$BASE_DIR"report/js/jquery-1.8.3.min.js report/js/bootstrap.min.js report/js/jquery.tablesorter.min.js > $REPORT_DIR/js/all.js
cp "$BASE_DIR"report/img/* $REPORT_DIR/img

if $OUTPUT_CSV
  then
   echo 'Create csv file' 
  $JAVA -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_DIR/result.xml $VELOCITY_DIR/pages-csv.vm $PROPERTIES_DIR/pages.properties $REPORT_DIR/pages.csv || exit 1
fi

if $OUTPUT_IMAGES 
  then
  echo 'Create all png:s'
 
  phantomjs $DEPENDENCIES_DIR/rasterize.js $REPORT_DIR/index.html $REPORT_IMAGE_PAGES_DIR/summary.png
  phantomjs $DEPENDENCIES_DIR/rasterize.js $REPORT_DIR/pages.html $REPORT_IMAGE_PAGES_DIR/pages.png

  for file in $REPORT_PAGES_DIR/*
  do
    filename=$(basename $file .html)
    phantomjs $DEPENDENCIES_DIR/rasterize.js $file $REPORT_IMAGE_PAGES_DIR/$filename.png
  done
fi

if $CREATE_TAR_ZIP
    then
      echo "Creating zip file"
      tar -cf $REPORT_DIR_NAME.tar $REPORT_DIR 
      gzip $REPORT_DIR_NAME.tar
    fi

echo "Finished"
exit 0