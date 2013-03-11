#! /bin/bash

# Set home
cd "$(dirname ${BASH_SOURCE[0]})"

 
DOMAIN_DIR=$(ls -1 ../build/sitespeed-result/ | head -n1);
DATE_DIR=$(ls -1 ../build/sitespeed-result/$DOMAIN_DIR | head -n1);
RESULT_DIR=$( cd ../build/sitespeed-result/$DOMAIN_DIR/$DATE_DIR && pwd)


files=( index.html errorurls.html pages.html rules.html pages/1.html pages/2.html pages/3.html)

for i in "${files[@]}"
do
   if [ ! -s $RESULT_DIR/$i ];
      	then
      		echo "The file $RESULT_DIR/$i  wasnt created"
      	exit 1
    fi		
done

if [ ! -s ../build/junit.xml ];
 then
     echo "The file build/junit.xml  wasnt created"
     exit 1
 fi


echo 'The test finished succesfully'


