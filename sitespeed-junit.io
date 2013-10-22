#! /bin/bash
#******************************************************
# sitespeed-junit.io - sitespeed.io LOVES Jenkins
# 
# Copyright (C) 2013 by Peter Hedenskog (http://www.peterhedenskog.com)
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


# Default result dir
REPORT_BASE_DIR=sitespeed-result

# The limit if a rule should signal an error
PAGE_LIMIT=90

# The average limit, if it is below this figure, it is an error
AVERAGE_LIMIT=90

# List of tests to skip.
SKIP_TESTS=

# Where to put the data
OUTPUT_DIR=

#*******************************************************
# Main program
#
#*******************************************************
main() {
        verify_environment 
        get_input "$@"
        find_right_dir
        verify_input
        parse_xsl
          
}

#*******************************************************
# Verify what we need. Since the regular sitespeed.io 
# script is run before, omnly check for the XSLT
#*******************************************************
function verify_environment() {
  command -v xsltproc  >/dev/null 2>&1 || { echo >&2 "Missing xsltproc, please install it to be able to run sitespeed-junit.io"; exit 1; }
}


#*******************************************************
# Fetch input from the user
#
#*******************************************************
function get_input {
# Set options
while getopts “hr:o:l:s:a:” OPTION
do
     case $OPTION in
         h)
             help
             exit 1
             ;;
         r)REPORT_BASE_DIR=$OPTARG;;
         l)PAGE_LIMIT=$OPTARG;;
         s)SKIP=$OPTARG;;
         a)AVERAGE_LIMIT=$OPTARG;;
         o)OUTPUT_DIR=$OPTARG;;
         ?)
             help
             exit
             ;;
     esac
done
}


#*******************************************************
# Verify the input
#
#*******************************************************
function verify_input() {

if [[ -z $OUTPUT_DIR ]]
then
     help
     exit 1
fi

# absolute path
if [[ "$OUTPUT_DIR" = /* ]]
then
OUTPUT_DIR=$OUTPUT_DIR
else
#relative
OUTPUT_DIR=$HOME/$OUTPUT_DIR
fi

OUTPUT_RULE_XML="--output $OUTPUT_DIR/sitespeed.io-rule-junit.xml"
OUTPUT_TIMINGS_XML="--output $OUTPUT_DIR/sitespeed.io-timings-junit.xml"

if [ "$SKIP" != "" ]
then
    SKIP_TESTS="--stringparam skip $SKIP"
fi
}

#*******************************************************
# Find where the files are that should be analyzed
#
#*******************************************************
function find_right_dir() {
# Switch to my dir
cd "$(dirname ${BASH_SOURCE[0]})"
HOME="$(pwd)"
cd $REPORT_BASE_DIR
HOST_DIR="$(ls -tr | tail -1)"
cd $HOST_DIR
DATE_DIR="$(ls -tr | tail -1)"
cd $DATE_DIR
ABSOLUTE_ANALYZE_DIR=$(pwd)
}

#*******************************************************
# Create the JUnit xml file & copy the summary
#
#*******************************************************
function parse_xsl(){
local rules_file=$(ls $ABSOLUTE_ANALYZE_DIR/data/pages/ | head -n 1)
local error_urls_file="$ABSOLUTE_ANALYZE_DIR/data/errorurls.xml"
local xsl_file=$HOME/report/xslt/junit.xsl
local result_xml=$ABSOLUTE_ANALYZE_DIR/data/result.xml
local xsl_timings_file=$HOME/report/xslt/junit-timings.xsl
local limits_file=$HOME/dependencies/timing-limits.xml

xsltproc --stringparam page-limit $PAGE_LIMIT --stringparam avg-limit $AVERAGE_LIMIT $OUTPUT_RULE_XML --stringparam rules-file $ABSOLUTE_ANALYZE_DIR/data/pages/$rules_file --stringparam error-urls-file $error_urls_file $SKIP_TESTS $xsl_file $result_xml 

xsltproc --stringparam limits-file $limits_file $OUTPUT_TIMINGS_XML $xsl_timings_file $result_xml

cp $ABSOLUTE_ANALYZE_DIR/data/summary.xml $OUTPUT_DIR/summary.xml
}

#*******************************************************
# Help function, call it to print all different usages.
#
#*******************************************************
function help()
{
cat << EOF
usage: $0 options

sitespeed-juni.io is a tool that will convert your sitespeed result into a junit.xml file. Read more at http://sitespeed.io

OPTIONS:
   -h      Help
   -o      The output dir
   -r      The result base directory, default is sitespeed-result [optional]
   -l      The page score limit. Below this page score it will be a failure. Default is 90. [optional]
   -a      The average score limit for all tested pages, below this score it will be a failure. Default is 90. [optional] 
   -s      Skip these tests. A comma separated list of the key name of the tests, for example "ycsstop,yjsbottom" [optional]   
 
EOF
}

# launch
main "$@"
