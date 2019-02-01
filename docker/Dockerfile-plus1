ARG version
FROM sitespeedio/sitespeed.io:${version}

ENV SITESPEED_IO_BROWSERTIME__XVFB true
ENV SITESPEED_IO_BROWSERTIME__DOCKER true
ENV SITESPEED_IO_BROWSERTIME__VIDEO true
ENV SITESPEED_IO_BROWSERTIME__visualMetrics true
ENV SITESPEED_IO_PLUGINS__ADD /lighthouse,/gpsi

RUN sudo apt-get update && sudo apt-get install git -y

WORKDIR /gpsi
RUN git clone https://github.com/sitespeedio/plugin-gpsi.git .
RUN npm install --production

WORKDIR /lighthouse
RUN git clone https://github.com/sitespeedio/plugin-lighthouse.git .
RUN npm install --production

VOLUME /sitespeed.io
WORKDIR /sitespeed.io
