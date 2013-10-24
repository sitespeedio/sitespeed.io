#! /bin/bash
JUNIT_XML=$1
if [[ ! -e $JUNIT_XML ]] 
then
 echo "Couldn't find $1"
 exit 1;
fi

 if grep -c "<failure" "$JUNIT_XML" > 0;
 then
   FAILURES=$(grep -o "<failure" $JUNIT_XML | wc -l)
   echo "We have a $FAILURES failure(s)"
   cat $JUNIT_XML
   exit 1;
 else
  echo "No failures from $1 sitespeed.io"
 fi