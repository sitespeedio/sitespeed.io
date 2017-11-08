FROM sitespeedio/sitespeed.io:5.6.5

# Install Go, WebPageReplay and the webpagereplay wrapper

WORKDIR /work
RUN apt-get update && apt-get install libnss3-tools \
  curl \
  git \
  iproute2 -y && \
  mkdir -p $HOME/.pki/nssdb && \
  certutil -d $HOME/.pki/nssdb -N && \
  curl -O https://storage.googleapis.com/golang/go1.9.linux-amd64.tar.gz && \
  tar -xvf go1.9.linux-amd64.tar.gz && \
  mv go /usr/local

ENV PATH="/usr/local/go/bin:${PATH}"

RUN go get github.com/urfave/cli && \
  go get golang.org/x/net/http2 && \
  go get github.com/catapult-project/catapult/web_page_replay_go/src/webpagereplay && \
  npm install webpagereplaywrapper -g

WORKDIR /root/go/src/github.com/catapult-project/catapult/web_page_replay_go
RUN go run src/wpr.go installroot

COPY start.sh /start.sh

WORKDIR /sitespeed.io

ENTRYPOINT ["/start.sh"]
