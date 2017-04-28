#! /bin/bash

# Combine two videos and slow down the result

if [[ -z $1 || -z $2 ]]; then
  echo "Missing input parameters"
  echo "$0 file1 file2 [outputfile.mp4]"
  exit 1
fi

if [ ! -f "$1" ] || [ ! -f "$2" ] ; then
    echo "File $1 or $2 not found!"
    exit 1
fi

TMP_VIDEO_DIR=tmp-video
FILE1=$(basename $1)
FILE2=$(basename $2)
OUTPUT_FILE=${3:-$(basename $1 .mp4)-vs-$(basename $2)}
SLOWDOWN=5.0

# Move the videos to a tmp dir so it is easy to mount them in Docker
mkdir $TMP_VIDEO_DIR
cp $1 $TMP_VIDEO_DIR
cp $2 $TMP_VIDEO_DIR

echo "Combining $FILE1 with $FILE2"

docker run -v "$(pwd)":/video sitespeedio/visualmetrics-deps ffmpeg \
  -i "/video/$TMP_VIDEO_DIR/$FILE1" \
  -i "/video/$TMP_VIDEO_DIR/$FILE2" \
  -filter_complex '[0:v]pad=iw*2:ih[int];[int][1:v]overlay=W/2:0[vid]' \
  -map [vid] \
  -c:v libx264 \
  -crf 23 \
  -preset veryfast \
  /video/$TMP_VIDEO_DIR/output.mp4  > /dev/null 2>&1

echo "Slow down the video"

docker run -v "$(pwd)":/video sitespeedio/visualmetrics-deps ffmpeg -i /video/$TMP_VIDEO_DIR/output.mp4 -filter:v "setpts=$SLOWDOWN*PTS" /video/${OUTPUT_FILE}  > /dev/null 2>&1
# Cleanup
rm -fR $TMP_VIDEO_DIR

echo "Combined and slowed down video: $OUTPUT_FILE"
