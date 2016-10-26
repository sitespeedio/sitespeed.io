FROM sitespeedio/webbrowsers:firefox-49.0-chrome-54.0

RUN useradd --user-group --create-home --shell /bin/false app && usermod -aG sudo app

# Enable passwordless sudo for users under the "sudo" group
RUN sed -i.bkp -e \
      's/%sudo\s\+ALL=(ALL\(:ALL\)\?)\s\+ALL/%sudo ALL=NOPASSWD:ALL/g' \
      /etc/sudoers

ENV HOME=/home/app

COPY package.json $HOME
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME
RUN npm install --production

USER root
COPY . $HOME

RUN chown -R app:app $HOME/*
USER app

COPY docker/scripts/start.sh /start.sh

ENTRYPOINT ["/start.sh"]
VOLUME /sitespeed.io
WORKDIR /sitespeed.io
