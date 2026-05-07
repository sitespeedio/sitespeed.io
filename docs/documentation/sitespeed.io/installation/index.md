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

{:toc}

You can install sitespeed.io using Docker or Node.js.

## Using Docker

Docker images include sitespeed.io, browsers (Chrome, Firefox, Edge), and tools for video recording and analysis.

### Example command (Mac & Linux)

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

### Windows

~~~bash
C:\Users\Vicky> docker pull sitespeedio/sitespeed.io
C:\Users\Vicky> docker run --rm -v ${pwd}:/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

That will output the data from the run in the current directory. You can read more about running the containers [here](/documentation/sitespeed.io/docker/).

## Using Node.js

Requires additional software like FFmpeg and Python dependencies.

### Installation steps for Apple Mac M1

Install on a fresh Apple Mac M1:

1. Install Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
2. Install the latest Node.js LTS (and npm). Either download it from [nodejs.org](https://nodejs.org/en/) or install using Homebrew (if you install using Homebrew, make sure you follow the instructions and add Node.js and npm to your PATH):
    `brew install node@24`
3. Make sure you can install using *npm* without sudo. Check out [Sindre Sorhus's guide](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).
4. Install ffmpeg
    `brew install ffmpeg`
5. Install the Python dependencies needed for Visual Metrics. macOS ships Python 3, so use that:
    ~~~bash
    python3 -m pip install --user pillow pyssim opencv-python numpy scipy
    ~~~
    On recent macOS versions, pip may refuse with "externally-managed-environment". If so, add `--break-system-packages` to the command above (or use a virtualenv).
6. To be able to throttle the connection without adding a sudo password you need to run:
    `echo "${USER} ALL=(ALL:ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/sitespeedio"`
7. If you plan to run the iOS Simulator, you also need to install Xcode. Either install it from the App Store, follow [MacStadium's guide](https://docs.macstadium.com/docs/install-osx-build-tools) or download it directly from [https://developer.apple.com/download/more/](https://developer.apple.com/download/more/). Verify that Xcode works by running `xcrun simctl list devices` to list your devices.
8. If you want to run tests on Android devices, you also need ADB. Install it using Homebrew like this: `brew install --cask android-platform-tools`
9. To be able to record a video you need to give access to **Screen Recording** for the **Terminal** App. You do that under **Privacy** settings.

Now you are ready to install sitespeed.io:
~~~bash
npm install sitespeed.io -g
~~~

After that you can also install the browsers that you need for your testing: [Chrome](https://www.google.com/chrome/)/[Firefox](https://www.mozilla.org/en-GB/firefox/new/)/Edge.

#### Also test on iOS over USB

If you want to drive a real iPhone or iPad over USB from this Mac, three extra dependencies on top of the install above:

1. Enable SafariDriver:
    ~~~bash
    safaridriver --enable
    ~~~
2. Install `ios-webkit-debug-proxy` (used by Browsertime for HAR capture):
    ~~~bash
    brew install ios-webkit-debug-proxy
    ~~~
3. The FFmpeg you installed in step 4 already covers video and visual metrics, nothing extra needed.

The phone-side setup (enable Remote Automation, trust the host, brightness/auto-lock) is documented in [Test on iOS](/documentation/sitespeed.io/mobile-phones/#test-on-ios).


### Linux

If you are using Ubuntu you can use our prebuilt script. It will install all dependencies you need to run sitespeed.io, including the latest Firefox and Chrome. Use it if you have a new machine or have just set up a new cloud instance. It will also create a new user *sitespeedio* that you will use to run sitespeed.io. The script has been tested on Ubuntu 24.04.

~~~bash
bash <(curl -sL https://gist.githubusercontent.com/soulgalore/18fbf40670a343fa1cb0606756c90a00/raw/7218332445010ee64e3301f2021bcf18a91f0627/install-sitespeed.io-and-dependencies-ubuntu.sh)
~~~

If you use Debian (the script has been tested on Debian 12) you can use:

~~~bash
wget -O - https://gist.githubusercontent.com/soulgalore/2f070b0a150360053f7198a4e9067db1/raw/cc1c56577195832225ddc36460f6fc53510d6de3/install-sitespeed.io-and-dependencies-debian.sh | bash
~~~

When it's finished you can try running sitespeed.io:

~~~bash
su - sitespeedio
sitespeed.io https://www.sitespeed.io --xvfb -b chrome --video --visualMetrics
~~~

You can also install everything manually to have more control. This is what's needed on Ubuntu 24.04:

1. [Install Node.js LTS](https://github.com/nodesource/distributions)
    * `curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -`
    * `sudo apt install -y nodejs`
2. Install ffmpeg `sudo apt-get update -y && sudo apt-get install -y ffmpeg`
3. Install Python dependencies:
    * `sudo apt-get install -y python-is-python3 python3-dev python3-pip`
    * `python -m pip install pyssim opencv-python numpy scipy`
4. Install xvfb: `sudo apt-get install -y xvfb`
5. Install ip and tc for network throttling to work: `sudo apt-get install -y net-tools`
6. Create a user that you will use to run sitespeed.io and switch to that user:
    * `adduser sitespeedio`
    * `usermod -aG sudo sitespeedio`
    * `su - sitespeedio`
7. Make sure that user can use sudo without password: `echo "sitespeedio ALL=(ALL:ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/sitespeedio"`
8. Make sure you can install using *npm* without sudo. Check out [Sindre Sorhus's guide](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).
9. Install sitespeed.io: `npm install sitespeed.io --location=global`

Before you start your testing you need to install a browser. Here's how you can install Firefox.

~~~bash
sudo apt install firefox -y
~~~

And if you want to use Chrome you can install it like this. `apt-key` was deprecated in Ubuntu 22.04, so we use a per-repository keyring file with `signed-by`:

~~~bash
sudo install -d -m 0755 /etc/apt/keyrings
wget -qO- https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install -y google-chrome-stable
~~~

And if you want to use Edge you can install it like this:

~~~bash
sudo install -d -m 0755 /etc/apt/keyrings
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /etc/apt/keyrings/microsoft.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/edge stable main" | sudo tee /etc/apt/sources.list.d/microsoft-edge.list
sudo apt-get update
sudo apt-get install -y microsoft-edge-stable
~~~

Try it out with Firefox:

~~~bash
sitespeed.io -n 5 -b firefox https://www.sitespeed.io --video --visualMetrics --xvfb --browsertime.flushDNS true --connectivity.engine throttle -c cable
~~~

Or with Chrome:

~~~bash
sitespeed.io -n 5 -b chrome https://www.sitespeed.io --video --visualMetrics --xvfb --browsertime.flushDNS true --connectivity.engine throttle -c cable
~~~

Or with Edge:

~~~bash
sitespeed.io -n 5 -b edge https://www.sitespeed.io --video --visualMetrics --xvfb --browsertime.flushDNS true --connectivity.engine throttle -c cable
~~~

### Windows

Check out [our GitHub Action running in Windows](https://github.com/sitespeedio/sitespeed.io/blob/main/.github/workflows/windowsFull.yml) to see how to install the dependencies you need.

If you run on Windows you can run tests on Firefox, Chrome and Edge.

### Raspberry Pi

You can use your Raspberry Pi to run tests on your Android phone(s). 

We have a [pre-made image](https://github.com/sitespeedio/raspberrypi) that you can use or follow the instructions below to create your own.

If you just want to run your test you can use Raspberry Pi OS Lite. If you also want to be able to see the phone screen on your desktop (for debugging) you can use Raspberry Pi OS Desktop.

Whether you use Raspberry Pi OS Lite or Desktop, you should do the following:

1. Write the latest version of Raspberry Pi OS Lite or Raspberry Pi OS Desktop to an SD card. If you use the **Raspberry Pi Imager**, make sure to enable SSH and choose a username/password in the settings.
2. Access your device using SSH.
3. Install Node.js. Install the [latest LTS](https://nodejs.org/en/); at the time of writing, that's version 24.
~~~bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install nodejs
~~~
4. Install ADB and Chromedriver.
~~~bash
sudo apt-get update
sudo apt-get install chromium-chromedriver adb -y
~~~
5. Install video and visual metrics dependencies.
~~~bash
sudo apt-get update && sudo apt-get install -y ffmpeg
python -m pip install pyssim opencv-python numpy scipy --break-system-packages
~~~
6. Follow [the instructions from npm how to install without sudo](https://github.com/sindresorhus/guides/blob/main/npm-global-without-sudo.md).
7. And then install sitespeed.io.
~~~bash
npm install sitespeed.io --location=global
~~~

8. (Optional) You probably want to use [gnirehtet](https://github.com/Genymobile/gnirehtet) to reverse-tether traffic from the phone back to the Raspberry Pi. That way you can throttle the connection on the Raspberry Pi and the phone will use the same connection. Follow the instructions at
[https://github.com/Genymobile/gnirehtet/blob/master/DEVELOP.md](https://github.com/Genymobile/gnirehtet/blob/master/DEVELOP.md) for how to build it for Raspberry Pi.

9. (Optional) You need Geckodriver if you want to run tests using Firefox on your phone. The easiest way to get Geckodriver on your Raspberry Pi is to build it on the Pi itself. You do that by cloning the Geckodriver repo and building the version you want. Check out how it's done at [https://github.com/jamesmortensen/geckodriver-arm-binaries](https://github.com/jamesmortensen/geckodriver-arm-binaries) and adapt it to your Raspberry Pi.

10. (Optional) If you are using Raspberry Pi 5 OS Desktop you can install scrcpy. Here's how to use it together with a Mac. First install scrcpy by building it on the Raspberry Pi, following the instructions at [https://github.com/Genymobile/scrcpy/blob/master/doc/linux.md#latest-version](https://github.com/Genymobile/scrcpy/blob/master/doc/linux.md#latest-version).

Then you need to enable the VNC server. Do it by running:

~~~bash
sudo raspi-config 
~~~
Choose option 3. and then 3. again (VNC).

Reboot your device:
~~~bash
sudo reboot
~~~

On your Mac, use "VNC Viewer" and use *raspberrypi.local* as the hostname. You will then be able to see the Raspberry Pi screen on your Mac. Start **scrcpy** and you will see the phone screen too.

11. Plug in your phone, allow USB debugging on it and run sitespeed.io:
~~~bash
sitespeed.io https://www.sitespeed.io --android -n 1 --video --visualMetrics
~~~

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

When using Docker, the browser and driver are bundled with the correct versions. If you install everything yourself, you may need to update driver versions.

You can download ChromeDriver yourself from [Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/) and use ```--chrome.chromedriverPath``` to help Browsertime find it. You can also choose which version to install when you install sitespeed.io with an environment variable:
```CHROMEDRIVER_VERSION=131.0.6778.85 npm install ```

You can also choose versions for Edge and Firefox with `EDGEDRIVER_VERSION` and `GECKODRIVER_VERSION`.
