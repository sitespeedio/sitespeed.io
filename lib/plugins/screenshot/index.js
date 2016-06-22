'use strict';

const path = require('path'),
  PNGCrop = require('png-crop'),
  Promise = require('bluebird');

Promise.promisifyAll(PNGCrop);

function getImagesAndName(images) {
  const imagesAndName = [];
  let i = 0;
  images.forEach(function(image) {
    imagesAndName.push({
      data: image,
      name: i + '.png'
    });
    i++;
  })
  return imagesAndName;
}

function storeFirefoxScreenshots(options, url, imagesAndName, storageManager) {
  const width = Number(options.browsertime.viewPort.split('x')[0]);
  const height = Number(options.browsertime.viewPort.split('x')[1]);

  // Firfox screenshots take the full height of the browser window, so Lets crop
  return storageManager.createDirForUrl(url, 'screenshots').
  then((dirPath) => {
    return Promise.map(imagesAndName, function(screenshot) {
      return PNGCrop.cropAsync(screenshot.data, path.join(dirPath, screenshot.name), {
        width,
        height
      });
    })
  })
}

function storeChromeScreenshots(url, imagesAndName, storageManager) {
  return storageManager.createDirForUrl(url, 'screenshots').
  then((dirPath) => {
    return Promise.map(imagesAndName, function(screenshot) {
      return storageManager.writeInDir(dirPath, screenshot.name, screenshot.data);
    })
  })
}

module.exports = {
  name() {
    return path.basename(__dirname);
  },
  open(context, options) {
    this.storageManager = context.storageManager;
    this.options = options;
  },
  processMessage(message) {
    switch (message.type) {
      case 'browsertime.screenshot':
        if (this.options.browser === 'firefox') {
          return storeFirefoxScreenshots(this.options, message.url, getImagesAndName(message.data), this.storageManager);
        } else {
          return storeChromeScreenshots(message.url, getImagesAndName(message.data), this.storageManager);
        }
    }
  }
};
