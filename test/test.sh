#! /bin/bash

# Set home
cd "$(dirname ${BASH_SOURCE[0]})"

 
DOMAIN_DIR=$(ls -1 ../build/build/ | head -n1);
DATE_DIR=$(ls -1 ../build/build/$DOMAIN_DIR | head -n1);
RESULT_DIR=$( cd ../build/build/$DOMAIN_DIR/$DATE_DIR && pwd)


files=( index.html errorurls.html pages.html pages.csv rules.html summary.details.html )

for i in "${files[@]}"
do
   if [ ! -s $RESULT_DIR/$i ];
      	then
      		echo "The file $RESULT_DIR/$i  wasnt created"
      	exit 1
    fi		
done

echo 'The test finished succesfully'


