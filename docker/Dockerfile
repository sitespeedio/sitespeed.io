FROM sitespeedio/browsers:4.0

MAINTAINER Peter Hedenskog <peter@soulgalore.com>

RUN apt-get update -y && apt-get install -y \
  build-essential \
  ca-certificates \
  curl \
  gcc \
  git \
  --no-install-recommends --force-yes && rm -rf /var/lib/apt/lists/*

# Install nodejs
RUN curl --silent --location https://deb.nodesource.com/setup_4.x | bash -  && \
  apt-get install nodejs -y

# And get sitespeed
RUN git clone https://github.com/sitespeedio/sitespeed.io.git && cd sitespeed.io && npm install -g

ADD ./scripts/ /home/root/scripts

VOLUME /sitespeed.io

WORKDIR /sitespeed.io
