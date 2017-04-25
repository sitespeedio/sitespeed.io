#! /bin/bash

# Combine two videos and slow down the result
# make sure the files are in the same dir as this script since we
# mount the current dir in Docker

if [[ -z $1 || -z $2 ]]; then
  echo "Missing input parameters"
  echo "$0 file1 file2 [outputfile.mp4]"
  exit 1
fi

FILE1="$1"
FILE2="$2"
OUTPUT_FILE=${3:-output_slow.mp4}
SLOWDOWN=5.0

if [ ! -f "$FILE1" ] || [ ! -f "$FILE2" ] ; then
    echo "File $FILE1 or $FILE2 not found!"
    exit 1
fi

echo "Combining $FILE1 with $FILE2"

docker run -v "$(pwd)":/video sitespeedio/visualmetrics-deps ffmpeg \
  -i "/video/$FILE1" \
  -i "/video/$FILE2" \
  -filter_complex '[0:v]pad=iw*2:ih[int];[int][1:v]overlay=W/2:0[vid]' \
  -map [vid] \
  -c:v libx264 \
  -crf 23 \
  -preset veryfast \
  /video/output.mp4  > /dev/null 2>&1

echo "Slow down the video"

docker run -v "$(pwd)":/video sitespeedio/visualmetrics-deps ffmpeg -i /video/output.mp4 -filter:v "setpts=$SLOWDOWN*PTS" /video/${OUTPUT_FILE}  > /dev/null 2>&1
rm output.mp4

echo "Combined and slowed down video $OUTPUT_FILE"
