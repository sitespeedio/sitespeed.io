'use strict';

const Promise = require('bluebird');
const sharp = require('sharp');
const get = require('lodash.get');

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

function storeScreenshots(url, imagesAndName, storageManager, options) {
  return Promise.map(imagesAndName, screenshot => {
    const maxSize = get(options, 'maxSize', defaultConfig.maxSize);
    const imageType = get(options, 'type', defaultConfig.type);
    if (imageType === 'png') {
      const compressionLevel = get(
        options,
        'png.compressionLevel',
        defaultConfig.png.compressionLevel
      );
      sharp(screenshot.data)
        .png({ compressionLevel })
        .resize(maxSize, maxSize)
        .max()
        .toBuffer()
        .then(newBuff => {
          return storageManager.writeDataForUrl(
            newBuff,
            screenshot.name,
            url,
            'screenshots'
          );
        });
    } else {
      const quality = get(options, 'jpg.quality', defaultConfig.jpg.quality);
      sharp(screenshot.data)
        .jpeg({ quality })
        .resize(maxSize, maxSize)
        .max()
        .toBuffer()
        .then(newBuff => {
          return storageManager.writeDataForUrl(
            newBuff,
            screenshot.name,
            url,
            'screenshots'
          );
        });
    }
  });
}

module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.make = context.messageMaker('screenshot').make;
    this.options = options.screenshot;
    this.imageType = get(this.options, 'type', defaultConfig.type);
  },
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'sitespeedio.setup': {
        queue.postMessage(
          make('browsertime.config', {
            screenshot: true,
            screenshotType: this.imageType
          })
        );
        break;
      }
      case 'browsertime.screenshot':
        return storeScreenshots(
          message.url,
          getImagesAndName(message.data.screenshots, this.imageType),
          this.storageManager,
          this.options
        );
    }
  },
  config: defaultConfig
};
