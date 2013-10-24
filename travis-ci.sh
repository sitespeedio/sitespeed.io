#! /bin/bash
JUNIT_XML=$1
 if grep -c "</failure>" "$JUNIT_XML" > 0;
 then
   FAILURES=$(grep -o "</failure">" $JUNIT_XML | wc -l)
   echo "We have a $FAILURES failure(s)"
   cat $JUNIT_XML
   exit 1;
 else
  echo 'No failures from $1 sitespeed.io'
 fi