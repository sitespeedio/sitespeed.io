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

# Installation

You can install sitespeed.io using Docker or NodeJS. 

## Using Docker

Docker images include sitespeed.io, browsers (Chrome, Firefox, Edge), and tools for video recording and analysis.

### Example command (Mac & Linux)

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

### Windows

~~~
C:\Users\Vicky> docker pull sitespeedio/sitespeed.io
C:\Users\Vicky> docker run --rm -v ${pwd}:/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

That will output the data from the run in the current directory. You can read more about running the containers [here](/documentation/sitespeed.io/docker/).

## Using Node JS

Requires additional software like FFmpeg and Python dependencies.

### Installation steps for Apple Mac M1

Install on a fresh Apple Mac M1:

1. Install Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
2. Install latest NodeJS LTS (and npm). Either download it from [nodejs.org](https://nodejs.org/en/) or install using Homebrew (if you install using Homebrew, make sure you follow the instructions and add NodeJS and npm to your PATH):
    `brew install node@20`
3. Make sure you can install using *npm* without using sudo. Checkout [Sindre Sorhus guide](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).
4. Install ffmpeg
    `brew install ffmpeg`
5. Install Python and Python dependencies ([Python best practices](https://opensource.com/article/19/5/python-3-default-mac)) (or make sure you use the pre-installed Python 3):
    1. `brew install pyenv` 
    2. `pyenv install 3.9.1`
    3. `pyenv global 3.9.1`
    4. `echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.zshrc`
    5. `source ~/.zshrc`
    6. `curl https://bootstrap.pypa.io/get-pip.py --output get-pip.py`
    7. `python get-pip.py --user`
    8. `python -m pip install --user pillow pyssim OpenCV-Python Numpy scipy`
6. To be able to throttle the connection without adding a sudo password you need to run:
    `echo "${USER} ALL=(ALL:ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/sitespeedio"`
7. If you plan to run the iOS Simulator, you also need to install Xcode. Either do it from the App store,  follow [Mac Stadiums guide](https://docs.macstadium.com/docs/install-osx-build-tools) or download directly from [https://developer.apple.com/download/more/](https://developer.apple.com/download/more/). Verify that Xcode work by running `xcrun simctl list devices` to list your devices.
8. If you want to run test on Android devices, you also need ADB. Install it using Homebrew like this: `brew install --cask android-platform-tools`
9. To be able to record a video you need to give access to **Screen Recording** for the **Terminal** App. You do that under **Privacy** settings.

Now you are ready to install sitespeed.io:
~~~bash
npm install sitespeed.io -g
~~~

After that you can also install the browsers that you need for your testing: [Chrome](https://www.google.com/chrome/)/[Firefox](https://www.mozilla.org/en-GB/firefox/new/)/Edge.


### Linux

If you are using Ubuntu you can use our prebuilt script. It will install all dependencies that you need to run sitespeed.io including latest Firefox and Chrome. Use it if you have a new machine or just setup a new cloud instance. It will also create a new user *sitespeedio* that you will use to run sitespeed.io. The script has been tested on Ubuntu 22.04.

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

You can also install everything manually to have more control. This is what's needed on Ubuntu 22.04:

1. [Install NodeJS LTS ](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04)
    * `curl -sL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh`
    * `sudo bash nodesource_setup.sh`
    * `sudo apt install -y nodejs`
2. Install ffmpeg `sudo apt-get update -y && sudo apt-get install -y ffmpeg`
3. Install Python dependencies:
    * `sudo apt-get install -y  python-is-python3 python3-dev python3-pip`  
    * `python -m pip install pyssim OpenCV-Python Numpy scipy`
4. Install xvfb: `sudo apt-get install -y xvfb`
5. Install ip and tc for network throttling to work: `sudo apt-get install -y net-tools`
6. Create a user that you will use to run sitespeed.io and switch to that user:
    * `adduser sitespeedio`
    * `usermod -aG sudo sitespeedio`
    * `su - sitespeedio`
7. Make sure that user can use sudo without password: `echo "sitespeedio ALL=(ALL:ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/sitespeedio"`
8. Make sure you can install using *npm* without using sudo. Checkout [Sindre Sorhus guide](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md).
9. Install sitespeed.io: `npm install sitespeed.io --location=global`

Before you start your testing you need to install a browser. Here's how you can install Firefox.

~~~bash
sudo apt install firefox -y
~~~

And if you want to use Chrome you can install it like this:

~~~bash
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt update
sudo apt install -y google-chrome-stable
~~~

And if you want to use Edge you can install it like this:

~~~bash
 curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
 sudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/
 sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge-dev.list'
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

Checkout [our GitHub action running in Windows](https://github.com/sitespeedio/sitespeed.io/blob/main/.github/workflows/windowsFull.yml) to see how to install the dependencies needed.

If you run on Windows you can run tests on Firefox, Chrome and Edge.

### Raspberry Pi

You can use your Raspberry Pi to run tests on your Android phone(s). 

We have a [pre-made image](https://github.com/sitespeedio/raspberrypi) that you can use or follow the instructions below to create your own.

If you just want to run your test you can use Raspberry Pi OS Lite. If you also want to be able to see the phone screen on your desktop (for debugging) you can use Raspberry Pi OS Desktop.

Independent if you use Raspberry Lite/Desktop you should do the following:

1. Write the latest version Raspberry Pi OS Lite/ Raspberry Pi OS Desktop on a SD card. If you use the **Raspberry Pi Imager** make sure to enable ssh and choose username/password in the settings.
2. Access your device using ssh.
3. Install NodeJS. Install [latest LTS](https://nodejs.org/en/), when I write this that version is 20.
~~~
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
~~~
4. Install ADB and Chromedriver.
~~~
sudo apt-get update
sudo apt-get install chromium-chromedriver adb -y
~~~
5. Install video and visual metrics dependencies.
~~~
sudo apt-get update && sudo apt-get install -y ffmpeg
python -m pip install pyssim OpenCV-Python Numpy scipy --break-system-packages
~~~
6. Follow [the instructions from npm how to install without sudo](https://github.com/sindresorhus/guides/blob/main/npm-global-without-sudo.md).
7. And then install sitespeed.io.
~~~bash
npm install sitespeed.io --location=global
~~~

8. (Optional) You probably want to use [Gnirenhet](https://github.com/Genymobile/gnirehtet) to reverse tethering back the the traffic from the phone to the Raspberry Pi. That way you can throttle the connection on the Raspberry Pi and the phone will use the same connection.  Follow the instructions on 
[https://github.com/Genymobile/gnirehtet/blob/master/DEVELOP.md](https://github.com/Genymobile/gnirehtet/blob/master/DEVELOP.md) how to build for Raspberry Pi.

9. (Optional) You need Geckodriver if you want to run tests using Firefox on your phone. The easiest way to get Geckodriver on your Raspberry Pi is to build it on that Pi. You do that by cloning the Geckodriver repo and build the version you want. Checkout how it's done at [https://github.com/jamesmortensen/geckodriver-arm-binaries](https://github.com/jamesmortensen/geckodriver-arm-binaries) and adapt it to your Raspberry.

10. (Optional) If you are using Raspberry Pi OS Desktop you can install scrcpy and vnc. Here's instructions how to use it together with a Mac. First install scrcpy:
~~~bash
sudo apt-get update && sudo apt-get install -y scrcpy
~~~
Then you need  to enable vnc server.
~~~bash
sudo systemctl enable vncserver-x11-serviced 
~~~
Then generate a password that you will use to connect to VNC from your computer
~~~bash
sudo vncpasswd -service
~~~
Then setup auth by edit the file */etc/vnc/config.d/common.custom*:
~~~bash
sudo nano /etc/vnc/config.d/common.custom
~~~
Add `Authentication=VncAuth` in the file and save and close.
Restart the vnc server:
~~~bash
sudo systemctl restart vncserver-x11-serviced
~~~
As the last step, make sure to export your display number to the environment variable DISPLAY.
~~~bash
echo 'export DISPLAY=:0' >> ~/.profile
~~~
Reboot your device:
~~~bash
sudo reboot
~~~
On your Mac, open "Screen Sharing" and then use *raspberrypi.local* as the hostname and the password you set in the previous step. You will then be able to see the Raspberry PI screen on your Mac. Start **scrcpy** and you will see the phone screen too.

11. Plugin your phone, "Allow USB debugging" on your phone and run sitespeed.io:
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

Using Docker the browser and driver is bundled with the correct versions. If you install everything yourself you may need to update driver versions.

You can download the ChromeDriver yourself from the [Google repo](https://chromedriver.storage.googleapis.com/index.html) and use ```--chrome.chromedriverPath``` to help Browsertime find it or you can choose which version to install when you install sitespeed.io with a environment variable: 
```CHROMEDRIVER_VERSION=81.0.4044.20 npm install ```

You can also choose versions for Edge and Firefox with `EDGEDRIVER_VERSION` and `GECKODRIVER_VERSION`.
