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
   echo 'Missing phantomjs, please install it to be able to run sitespeed.io'
   exit 1;
fi


#*******************************************************
# Help function, call it to print all different usages.
#
#*******************************************************
help()
{
cat << EOF
usage: $0 options

Sitespeed is a tool that helps you analyze your web site performance and show you what you should optimize, more info at http://sitespeed.io

OPTIONS:
   -h      Help
   -u      The start url for the test: http[s]://host[:port][/path/]
   -d      The crawl depth, default is 1 [optional]
   -f      Crawl only on this path [optional]
   -s      Skip urls that contains this in the path [optional]
   -p      The number of processes that will analyze pages, default is 5 [optional]
   -m      The memory heap size for the java applications, defaukt is 1024 kb [optional]
   -o      The output format, always output as html but you can add images and/or csv (img,csv) [optional]
   -r      The result base directory, default is sitespeed-result [optional]
   -z      Create a tar zip file of the results, default is false [optional]
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
    phantomjs dependencies/yslow-3.1.4-sitespeed.js -d -r sitespeed.io-1.4 -f xml "$url" >"$REPORT_DATA_PAGES_DIR/$pagefilename.xml" || exit 1
 
    # Sometimes the yslow script adds output before the xml tag, should probably be reported ...
    sed '/<?xml/,$!d' $REPORT_DATA_PAGES_DIR/$pagefilename.xml > $REPORT_DATA_PAGES_DIR/$pagefilename-bup  || exit 1
  
    # And crazy enough, sometimes we get things after the end of the xml
    sed -n '1,/<\/results>/p' $REPORT_DATA_PAGES_DIR/$pagefilename-bup > $REPORT_DATA_PAGES_DIR/$pagefilename.xml || exit 1
 
    # Hack for adding link to the output file name
    sed 's/<results>/<results filename="'$pagefilename'">/g' $REPORT_DATA_PAGES_DIR/$pagefilename.xml > $REPORT_DATA_PAGES_DIR/$pagefilename-bup || exit 1
    mv $REPORT_DATA_PAGES_DIR/$pagefilename-bup $REPORT_DATA_PAGES_DIR/$pagefilename.xml
   
    java -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_PAGES_DIR/$pagefilename.xml $VELOCITY_DIR/page.vm $PROPERTIES_DIR/page.properties $REPORT_PAGES_DIR/$pagefilename.html || exit 1    

    java -jar $DEPENDENCIES_DIR/$HTMLCOMPRESSOR_JAR --type html --compress-css --compress-js -o $REPORT_PAGES_DIR/$pagefilename.html $REPORT_PAGES_DIR/$pagefilename.html
   
}

# All the options that you can configure when you run the script
URL=
DEPTH=
FOLLOW_PATH=
NOT_IN_URL=
MAX_PROCESSES=
OUTPUT_FORMAT=
JAVA_HEAP=
REPORT_BASE_DIR=
CREATE_TAR_ZIP=false

# Set options
while getopts “hu:d:f:s:o:m:p:r:z:” OPTION
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

if [[ -z $DEPTH ]] 
then
     DEPTH="1"
fi

if [[ -z $JAVA_HEAP ]] 
then
     JAVA_HEAP="1024"
fi

if [[ -z $MAX_PROCESSES ]] 
then
     MAX_PROCESSES="5"
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

# FInished verify the input

# Switch to my dir
cd "$(dirname ${BASH_SOURCE[0]})"

NOW=$(date +"%Y-%m-%d-%H-%M-%S")
DATE=$(date) 

echo "Will crawl from start point $URL with depth $DEPTH $FOLLOW_PATH $NOT_IN_URL ... this can take a while"

# remove the protocol                                                                                                                                                            
NOPROTOCOL=${URL#*//}
HOST=${NOPROTOCOL%%/*}

# Jar files
CRAWLER_JAR=crawler-0.9.4-full.jar
VELOCITY_JAR=xml-velocity-1.2-full.jar
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

java -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -cp $DEPENDENCIES_DIR/$CRAWLER_JAR com.soulgalore.crawler.run.CrawlToFile -u $URL -l $DEPTH $FOLLOW_PATH $NOT_IN_URL -f $REPORT_DATA_DIR/urls.txt -ef $REPORT_DATA_DIR/nonworkingurls.txt

if [ ! -e $REPORT_DATA_DIR/urls.txt ];
then
echo "No url:s was fetched"
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

echo "Create result.xml"

echo '<?xml version="1.0" encoding="UTF-8"?><document host="'$HOST'" url="'$URL'" date="'$DATE'">' > $REPORT_DATA_DIR/result.xml
for file in $REPORT_DATA_PAGES_DIR/*
do
  # Hack for removing dictonaries in the result file
  sed 's#<dictionary>.*#</results>#' "$file" > $REPORT_DATA_DIR/tmp.txt || exit 1
  sed 's/<?xml version="1.0" encoding="UTF-8"?>//g' "$REPORT_DATA_DIR/tmp.txt" >> "$REPORT_DATA_DIR/result.xml" || exit 1
  rm "$REPORT_DATA_DIR/tmp.txt"

done 
echo '</document>'>> "$REPORT_DATA_DIR/result.xml"

echo 'Create the pages.html'
java -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_DIR/result.xml $VELOCITY_DIR/pages.vm $PROPERTIES_DIR/pages.properties $REPORT_DIR/pages.html || exit 1
java -jar $DEPENDENCIES_DIR/$HTMLCOMPRESSOR_JAR --type html --compress-css --compress-js -o $REPORT_DIR/pages.html $REPORT_DIR/pages.html


echo 'Create the summary index.html'
java -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_DIR/result.xml $VELOCITY_DIR/summary.vm $PROPERTIES_DIR/summary.properties $REPORT_DIR/index.html || exit 1
java -jar $DEPENDENCIES_DIR/$HTMLCOMPRESSOR_JAR --type html --compress-css --compress-js -o $REPORT_DIR/index.html $REPORT_DIR/index.html

echo 'Create the rules.html'
java -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_PAGES_DIR/1.xml $VELOCITY_DIR/rules.vm $PROPERTIES_DIR/rules.properties $REPORT_DIR/rules.html || exit 1
java -jar $DEPENDENCIES_DIR/$HTMLCOMPRESSOR_JAR --type html --compress-css --compress-js -o $REPORT_DIR/rules.html $REPORT_DIR/rules.html

#copy the rest of the files
mkdir $REPORT_DIR/css
mkdir $REPORT_DIR/js
mkdir $REPORT_DIR/img

cat "$BASE_DIR"report/css/bootstrap.min.css > $REPORT_DIR/css/styles.css
cat "$BASE_DIR"report/js/jquery-1.8.2.min.js report/js/bootstrap.min.js report/js/jquery.tablesorter.min.js > $REPORT_DIR/js/all.js
cp "$BASE_DIR"report/img/* $REPORT_DIR/img

if $OUTPUT_CSV
  then
   echo 'Create csv file' 
  java -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $REPORT_DATA_DIR/result.xml $VELOCITY_DIR/pages-csv.vm $PROPERTIES_DIR/pages.properties $REPORT_DIR/pages.csv || exit 1
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