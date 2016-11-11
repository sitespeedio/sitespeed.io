FROM sitespeedio/webbrowsers:firefox-49.0-chrome-54.0

ENV SITESPEED_IO_BROWSERTIME__XVFB true

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production
COPY . /usr/src/app

COPY docker/scripts/start.sh /start.sh

ENTRYPOINT ["/start.sh"]
VOLUME /sitespeed.io
WORKDIR /sitespeed.io
