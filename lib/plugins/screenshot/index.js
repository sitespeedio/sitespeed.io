'use strict';

const Promise = require('bluebird');
const sharp = require('sharp');
const merge = require('lodash.merge');

const defaultConfig = {
  type: 'png',
  png: {
    compressionLevel: 6
  },
  jpg: {
    quality: 80
  },
  maxSize: 2000
};

function getImagesAndName(images, imageType) {
  return images.map((image, index) => {
    return {
      data: image,
      name: index + '.' + imageType
    };
  });
}

function storeScreenshots(url, imagesAndName, storageManager, config) {
  return Promise.map(imagesAndName, screenshot => {
    if (config.type === 'png') {
      return sharp(screenshot.data)
        .png({ compressionLevel: config.png.compressionLevel })
        .resize(config.maxSize, config.maxSize)
        .max()
        .toBuffer()
        .then(newBuff =>
          storageManager.writeDataForUrl(
            newBuff,
            screenshot.name,
            url,
            'screenshots'
          )
        );
    } else {
      return sharp(screenshot.data)
        .jpeg({ quality: config.jpg.quality })
        .resize(config.maxSize, config.maxSize)
        .max()
        .toBuffer()
        .then(newBuff =>
          storageManager.writeDataForUrl(
            newBuff,
            screenshot.name,
            url,
            'screenshots'
          )
        );
    }
  });
}

module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.make = context.messageMaker('screenshot').make;
    this.config = merge({}, defaultConfig, options.screenshot);
  },
  processMessage(message, queue) {
    switch (message.type) {
      case 'browsertime.setup': {
        queue.postMessage(
          this.make('browsertime.config', {
            screenshot: true,
            screenshotType: this.config.type
          })
        );
        break;
      }
      case 'browsertime.screenshot':
        return storeScreenshots(
          message.url,
          getImagesAndName(message.data, this.config.type),
          this.storageManager,
          this.config
        );
    }
  },
  config: defaultConfig
};
