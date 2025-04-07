FROM sitespeedio/webbrowsers:chrome-135.0-firefox-137.0-edge-135.0-1

ARG TARGETPLATFORM=linux/amd64

ENV SITESPEED_IO_BROWSERTIME__XVFB=true
ENV SITESPEED_IO_BROWSERTIME__DOCKER=true
ENV PYTHON=python3

COPY docker/webpagereplay/$TARGETPLATFORM/wpr /usr/local/bin/
COPY docker/webpagereplay/wpr_cert.pem /webpagereplay/certs/
COPY docker/webpagereplay/wpr_key.pem /webpagereplay/certs/
COPY docker/webpagereplay/deterministic.js /webpagereplay/scripts/deterministic.js
COPY docker/webpagereplay/LICENSE /webpagereplay/

RUN sudo apt-get update && sudo apt-get install libnss3-tools \
    net-tools \
    build-essential \
    iproute2 -y && \
    mkdir -p $HOME/.pki/nssdb && \
    certutil -d $HOME/.pki/nssdb -N

ENV PATH="/usr/local/bin:${PATH}"

RUN wpr installroot --https_cert_file /webpagereplay/certs/wpr_cert.pem --https_key_file /webpagereplay/certs/wpr_key.pem

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY npm-shrinkwrap.json /usr/src/app/
COPY tools/postinstall.js /usr/src/app/tools/postinstall.js
RUN npm install --production && npm cache clean --force 

COPY ./bin/ /usr/src/app/bin/
COPY ./lib/ /usr/src/app/lib/
RUN rm -fR /usr/src/app/node_modules/selenium-webdriver/bin

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
VOLUME /baseline

WORKDIR /sitespeed.io
