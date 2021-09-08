---
layout: default
title: Install sitespeed.io using npm/yarn or Docker.
description: Install "npm install sitespeed.io -g" or "yarn global add sitespeed.io".
keywords: installation, documentation, web performance, sitespeed.io, yarn, npm, docker
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Install sitespeed.io using npm, yarn or Docker.
---
[Documentation](/documentation/sitespeed.io/) / Installation

# Installation
{:.no_toc}

* Lets place the TOC here
{:toc}

# Install
You can run sitespeed.io using our Docker containers or using NodeJS.

## Docker

We have [Docker images](https://hub.docker.com/r/sitespeedio/sitespeed.io/) with sitespeed.io, Chrome, Firefox, Xvfb and all the software needed for recording a video of the browser screen and analyse it to get Visual Metrics. It is super easy to use). Here's how to use the container with both Firefox & Chrome (install [Docker](https://docs.docker.com/install/) first).

### Mac & Linux

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

### Windows

~~~
C:\Users\Vicky> docker pull sitespeedio/sitespeed.io
C:\Users\Vicky> docker run --rm -v ${pwd}:/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

That will output the data from the run in the current directory. You can read more about running the containers [here](/documentation/sitespeed.io/docker/).

## Node JS

### Mac
To be able to record a video of the screen and analyse the video, you need a couple of extra software except sitespeed.io. 

You need: [FFmpeg](https://ffmpeg.org), [ImageMagick 6](https://imagemagick.org/index.php) and [pillow](https://pillow.readthedocs.io/en/stable/).

Install on a fresh Apple Mac M1:

1. Install Homebrew [https://brew.sh](https://brew.sh)
2. Install latest NodeJS LTS (and npm). Either download it from [nodejs.org](https://nodejs.org/en/) or install using Homebrew:
    `brew install node@14`
3. Make sure you can install using *npm* without using sudo. Checkout [Sindre Sorhus guide](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).
4. Install ImageMagick 6
    `brew install imagemagick@6`
5. Install ffmpeg
    `brew install ffmpeg`
6. Install Python and Python dependencies ([Python best practices](https://opensource.com/article/19/5/python-3-default-mac)) (or make sure you use the pre-installed Python 3):
    1. `brew install pyenv` 
    2. `pyenv install 3.9.1`
    3. `pyenv global 3.9.1`
    4. `echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.zshrc`
    5. `source ~/.zshrc`
    6. `curl https://bootstrap.pypa.io/get-pip.py --output get-pip.py`
    7. `python get-pip.py --user`
    8. `python -m pip install --user pillow`
7. To be able to throttle the connection without adding a sudo password you need to run:
    `echo "${USER} ALL=(ALL:ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/sitespeedio"`
8. If you plan to run the iOS Simulator, you also need to install Xcode. Either do it from the App store,  follow [Mac Stadiums guide](https://docs.macstadium.com/docs/install-osx-build-tools) or download directly from [https://developer.apple.com/download/more/](https://developer.apple.com/download/more/). Verify that Xcode work by running `xcrun simctl list devices` to list your devices.
9. If you want to run test on Android devices, you also need ADB. Install it using Homebrew like this: `brew install --cask android-platform-tools`

Now you are ready to install sitespeed.io:
~~~bash
npm install sitespeed.io -g
~~~

After that you can also install the browsers that you need for your testing: [Chrome](https://www.google.com/chrome/)/[Firefox](https://www.mozilla.org/en-GB/firefox/new/)/Edge.


### Linux

Here's an example on how to install on Ubuntu 20.04. 

1. [Install NodeJS LTS ](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
    * `curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh`
    * `sudo bash nodesource_setup.sh`
    * `sudo apt install -y nodejs`
2. Install imagemagick and ffmpeg `sudo apt-get update -y && sudo apt-get install -y imagemagick ffmpeg`
3. Install Python dependencies:
    * `sudo apt-get install -y  python-is-python3 python3-dev python3-pip`  
    * `python -m pip install pyssim`
4. Install xvfb: `sudo apt-get install -y xvfb`
5. Install ip and route for network throttling to work: `sudo apt-get install -y net-tools`
6. Create a user that you will use to run sitespeed.io and switch to that user:
    * `adduser sitespeedio`
    * `usermod -aG sudo sitespeedio`
    * `su - sitespeedio`
7. Make sure that user can use sudo without password: `echo "${USER} ALL=(ALL:ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/sitespeedio"`
8. Make sure you can install using *npm* without using sudo. Checkout [Sindre Sorhus guide](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).
9. Install sitespeed.io `EDGEDRIVER_VERSION=89.0.723.0 npm install sitespeed.io -g`

Before you start your testing you need to install a browser. Here's how you can install Chrome.

~~~bash
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt update
sudo apt install -y google-chrome-stable
~~~

Try it out:

~~~bash
sitespeed.io --browsertime.xvfb -n 1 -b chrome https://www.sitespeed.io --video --visualMetrics
~~~

### Windows

Checkout [our GitHub action running in Windows](https://github.com/sitespeedio/browsertime/blob/main/.github/workflows/windows.yml) to see how to install the dependencies needed.

If you run on Windows you can run tests on Firefox, Chrome and Edge.

### Skip installing ChromeDriver/GeckoDriver/EdgeDriver
If you don't want to install ChromeDriver, EdgeDriver or GeckoDriver when you install through npm you can skip them with an environment variable.

Skip installing ChromeDriver:

~~~bash
CHROMEDRIVER_SKIP_DOWNLOAD=true npm install sitespeed.io -g
~~~

Skip installing GeckoDriver:

~~~bash
GECKODRIVER_SKIP_DOWNLOAD=true npm install sitespeed.io -g
~~~

Skip installing EdgeDriver:

~~~bash
EDGEDRIVER_SKIP_DOWNLOAD=true npm install sitespeed.io -g
~~~

### Updating ChromeDriver/GeckoDriver/EdgeDriver

Using Docker the browser and driver is bundled with the correct versions. If you install everything yourself you may need to update driver versions.

Since the ChromeDriver team decided that a ChromeDriver version needs to match a browser version, it has been more work to test other Chrome versions.

You can download the ChromeDriver yourself from the [Google repo](https://chromedriver.storage.googleapis.com/index.html) and use ```--chrome.chromedriverPath``` to help Browsertime find it or you can choose which version to install when you install sitespeed.io with a environment variable: 
```CHROMEDRIVER_VERSION=81.0.4044.20 npm install ```

You can also choose versions for Edge and Firefox with `EDGEDRIVER_VERSION` and `GECKODRIVER_VERSION`.
