FROM sitespeedio/webbrowsers:firefox-50.0-chrome-54.0

ENV SITESPEED_IO_BROWSERTIME__XVFB true
ENV SITESPEED_IO_BROWSERTIME__CONNECTIVITY__ENGINE tc

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production
COPY . /usr/src/app

COPY docker/scripts/start.sh /start.sh

ENTRYPOINT ["/start.sh"]
VOLUME /sitespeed.io
WORKDIR /sitespeed.io
