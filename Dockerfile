FROM sitespeedio/webbrowsers:chrome-91.0-firefox-89.0-edge-91.0-dev-2

ENV SITESPEED_IO_BROWSERTIME__XVFB true
ENV SITESPEED_IO_BROWSERTIME__DOCKER true

COPY docker/webpagereplay/wpr /usr/local/bin/
COPY docker/webpagereplay/wpr_cert.pem /webpagereplay/certs/
COPY docker/webpagereplay/wpr_key.pem /webpagereplay/certs/
COPY docker/webpagereplay/deterministic.js /webpagereplay/scripts/deterministic.js
COPY docker/webpagereplay/LICENSE /webpagereplay/


RUN sudo apt-get update && sudo apt-get install libnss3-tools python2 \
    net-tools \
    build-essential \
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

# Allow all users to run commands needed by sitespeedio/throttle via sudo
# See https://github.com/sitespeedio/throttle/blob/main/lib/tc.js
RUN echo 'ALL ALL=NOPASSWD: /usr/sbin/tc, /usr/sbin/route, /usr/sbin/ip' > /etc/sudoers.d/tc

ENTRYPOINT ["/start.sh"]
VOLUME /sitespeed.io
WORKDIR /sitespeed.io
