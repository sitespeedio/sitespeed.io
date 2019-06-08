FROM sitespeedio/webbrowsers:chrome-75-firefox-67.0.1

ENV SITESPEED_IO_BROWSERTIME__XVFB true
ENV SITESPEED_IO_BROWSERTIME__DOCKER true
ENV SITESPEED_IO_BROWSERTIME__VIDEO true
ENV SITESPEED_IO_BROWSERTIME__visualMetrics true

COPY docker/webpagereplay/wpr /usr/local/bin/
COPY docker/webpagereplay/wpr_cert.pem /webpagereplay/certs/
COPY docker/webpagereplay/wpr_key.pem /webpagereplay/certs/
COPY docker/webpagereplay/deterministic.js /webpagereplay/scripts/deterministic.js
COPY docker/webpagereplay/LICENSE /webpagereplay/

# build-essential is needed for Sharp to compile
RUN sudo apt-get update && sudo apt-get install libnss3-tools \
 net-tools \
 iproute2 -y && \
 mkdir -p $HOME/.pki/nssdb && \
 certutil -d $HOME/.pki/nssdb -N

ENV PATH="/usr/local/bin:${PATH}"

RUN wpr installroot --https_cert_file /webpagereplay/certs/wpr_cert.pem --https_key_file /webpagereplay/certs/wpr_key.pem

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
