FROM sitespeedio/webbrowsers

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN npm install -g

COPY docker/scripts/start.sh /start.sh

ENTRYPOINT ["/start.sh"]

WORKDIR /sitespeed.io
VOLUME /sitespeed.io
