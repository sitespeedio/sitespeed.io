FROM sitespeedio/webbrowsers:firefox-54.0-chrome-63.0-2

ENV SITESPEED_IO_BROWSERTIME__XVFB true
ENV SITESPEED_IO_BROWSERTIME__DOCKER true
ENV SITESPEED_IO_BROWSERTIME__VIDEO true
ENV SITESPEED_IO_BROWSERTIME__speedIndex true

# This is needed for Sharp to compile
RUN sudo apt-get update && sudo apt-get install build-essential -y --no-install-recommends

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.* /usr/src/app/
RUN npm install --production
COPY . /usr/src/app

COPY docker/scripts/start.sh /start.sh

## This is to avoid click the OK button
RUN mkdir -m 0750 /root/.android
ADD docker/adb/insecure_shared_adbkey /root/.android/adbkey
ADD docker/adb/insecure_shared_adbkey.pub /root/.android/adbkey.pub

ENTRYPOINT ["/start.sh"]
VOLUME /sitespeed.io
WORKDIR /sitespeed.io
