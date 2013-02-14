#! /bin/bash

# Set home
cd "$(dirname ${BASH_SOURCE[0]})"

 
UNIQUE_DIR=$(ls -1 ../build/sitespeed-result/ | head -n1);
RESULT_DIR=$( cd ../build/sitespeed-result/$UNIQUE_DIR && pwd)


files=( index.html errorurls.html pages.html rules.html pages/1.html pages/2.html pages/3.html junit.xml)

for i in "${files[@]}"
do
   if [ ! -s $RESULT_DIR/$i ];
      	then
      		echo "The file $RESULT_DIR/$i  wasnt created"
      	exit 1
    fi		
done

echo 'The test finished succesfully'


