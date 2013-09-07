#! /bin/bash
#******************************************************
# sitespeed-sites.io - How speedy is all the sites?
# 
# Copyright (C) 2013 by Peter Hedenskog (http://peterhedenskog.com)
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

# Setting up options
REPORT_BASE_DIR=sitespeed-result/sites

# Used for the directory name
NOW=$(date +"%Y-%m-%d-%H-%M-%S")

# The heap size for the Java processes
JAVA_HEAP=1024

# The default name of the file that hold the urls
FILE_NAME=urls.txt

# Version of the Jar-files used.
VELOCITY_JAR=xml-velocity-1.8-SNAPSHOT-full.jar
HTMLCOMPRESSOR_JAR=htmlcompressor-1.5.3.jar

# Setup dirs                                                                                                                                                             
DEPENDENCIES_DIR=dependencies
VELOCITY_DIR=report/velocity
PROPERTIES_DIR=report/properties

# The menu in the header of the result file is hidden
HIDE_MENU="-Dcom.soulgalore.velocity.key.hidemenu=true"

#*******************************************************
# Main program
#
#*******************************************************
main() {
  verify_environment
  get_input "$@"
	analyze "$@"
  generate_sites_xml
  generate_output_files
  finish
}

#*******************************************************
# Help function, call it to print all different usages.
#
#*******************************************************
help()
{
cat << EOF
usage: $0 options

Multi

OPTIONS:
   -h      Help
   -r      The result base directory, default is sitespeed-result/sites [optional]
   -e      The colums to display in the result table [optional]
   -i      The path to a plain text file with one url on each row. Default name is urls.txt [optional]
EOF
}

#******************************************************* 
# Fetch input
#
#*******************************************************
function get_input {

# Set options, the sames as for sitespeed.io
while getopts “hud:f:s:o:m:b:n:p:r:z:x:g:t:a:v:y:l:c:j:e:i:” OPTION
do
     case $OPTION in
         h)
             help
             exit 1
             ;;
         r)REPORT_BASE_DIR=$OPTARG;;
	       ## Special handling for u & f, because that is sitespeed.io specific
	       u) 
	       echo "-u is an invalid argument, feed the script with a list of url:s" 
	       exit 1;;
         f) 
         echo "-f is an invalid argument, feed the script with a list of url:s" 
         exit 1;;
         m)JAVA_HEAP=$OPTARG;;  
         n)TEST_NAME=$OPTARG;;
         e)COLUMNS=$OPTARG;;   
         i)FILE_NAME=$OPTARG;;      
	       ?)
              ;;
      esac
done


if [ "$TEST_NAME" != "" ]
  then
    TEST_NAME="-Dcom.soulgalore.velocity.key.testname=$TEST_NAME"
  else
    TEST_NAME="-Dcom.soulgalore.velocity.key.testname= "
fi

if [ "$COLUMNS" != "" ]
  then
    COLUMNS="-Dcom.soulgalore.velocity.key.columns=$COLUMNS"
  else
    # Default colums
    COLUMNS="-Dcom.soulgalore.velocity.key.columns=median-score,median-criticalpath,median-jssyncinhead,median-requests,median-totalimageweight,median-pageweight,median-assetswithoutexpires,median-assetcachetimeinseconds,median-timesincelastmodificationinseconds,median-domains"
fi

if [ ! -f $FILE_NAME ]
then
    echo The $FILE_NAME file does not exist. Use -i to feed the script with which file to use. 
    exit 1
fi


}

function analyze {

local runs=0

# read the urls
local urls=()
while read txt ; do
   urls[${#urls[@]}]=$txt
done < $FILE_NAME

echo "Will analyze ${#urls[@]} sites" 

for url in "${urls[@]}" 
do   
    sh ./sitespeed.io -u $url "$@" -r $REPORT_BASE_DIR/$NOW
    runs=$[$runs+1]
    if [ $(($runs%20)) == 0 ]; then
      echo "Analyzed $runs sites out of ${#urls[@]}"
    fi
done

}

#*******************************************************
# Generate a sites xml file that holds all 
# latest analyzed versions of a site, using the
# summary.xml file
#*******************************************************
function generate_sites_xml {

# Switch to my dir                                                                                                                                                                                  
cd "$(dirname ${BASH_SOURCE[0]})"
HOME="$(pwd)"

# Here is the output file
local sites_xml=$HOME/$REPORT_BASE_DIR/$NOW/sites.xml

echo '<?xml version="1.0" encoding="UTF-8"?><sites>'  > "$sites_xml" 

cd $REPORT_BASE_DIR/$NOW

for i in * ; do
  if [ -d "$i" ]; then
    echo "Adding $i to sites.xml"
    cd "$i"
    local date_dir="$(\ls -1dt */ | head -n 1)"
    cd $date_dir
    local abs_analyze_dir=$(pwd)
    local summary_xml="$abs_analyze_dir/data/summary.xml"
    if [ -e $summary_xml ]; then
	  sed 's/<?xml version="1.0" encoding="UTF-8"?>//g' $summary_xml >> "$sites_xml"
    else
	  echo "Missing summary.xml for $i, will not add that to the sites.xml"
    fi
    cd ../../
  fi
done

echo '</sites>'  >> "$sites_xml"
cd $HOME
}

function generate_output_files {

echo 'Create the index.html'
"$JAVA" -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m "$HIDE_MENU" "$COLUMNS" -jar $DEPENDENCIES_DIR/$VELOCITY_JAR $HOME/$REPORT_BASE_DIR/$NOW/sites.xml $VELOCITY_DIR/sites.summary.vm $PROPERTIES_DIR/sites.summary.properties $HOME/$REPORT_BASE_DIR/$NOW/index.html || exit 1
"$JAVA" -jar $DEPENDENCIES_DIR/$HTMLCOMPRESSOR_JAR --type html --compress-css --compress-js -o $HOME/$REPORT_BASE_DIR/$NOW/index.html $HOME/$REPORT_BASE_DIR/$NOW/index.html

#copy the rest of the files
mkdir $REPORT_BASE_DIR/$NOW/css
mkdir $REPORT_BASE_DIR/$NOW/js
mkdir $REPORT_BASE_DIR/$NOW/img
mkdir $REPORT_BASE_DIR/$NOW/img/ico
mkdir $REPORT_BASE_DIR/$NOW/fonts

cat "$BASE_DIR"report/css/bootstrap.min.css > $REPORT_BASE_DIR/$NOW/css/styles.css
cat "$BASE_DIR"report/js/jquery-1.10.2.min.js report/js/bootstrap.min.js report/js/stupidtable.min.js > $REPORT_BASE_DIR/$NOW/js/all.js
cp "$BASE_DIR"report/img/*.* $REPORT_BASE_DIR/$NOW/img
cp "$BASE_DIR"report/img/ico/* $REPORT_BASE_DIR/$NOW/img/ico
cp "$BASE_DIR"report/fonts/* $REPORT_BASE_DIR/$NOW/fonts

}

function finish {
  echo "Finish"
  exit 0
}

#*******************************************************
# Check that we have what is needed to run
# Will check for PhantomJS, cURL and right Java version
#*******************************************************
function verify_environment {
command -v phantomjs >/dev/null 2>&1 || { echo >&2 "Missing phantomjs, please install it to be able to run sitespeed.io"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo >&2 "Missing curl, please install it to be able to run sitespeed.io"; exit 1; }

# Respect JAVA_HOME if set
if [[ -n "$JAVA_HOME" ]] && [[ -x "$JAVA_HOME/bin/java" ]]
then
    JAVA="$JAVA_HOME/bin/java"
else
    JAVA="java"
fi

if [[ "$JAVA" ]]; then
    jVersion=$("$JAVA" -version 2>&1 | awk -F '"' '/version/ {print $2}')
    if [[ "$jVersion" < "1.6" ]]; then
         echo "Java version is less than 1.6 which is too old, you will need at least Java 1.6 to run sitespeed.io"; exit 1;
    fi
fi
}

# launch
main "$@"


