'use strict';

const Promise = require('bluebird');
const sharp = require('sharp');

function getImagesAndName(images, options) {
  return images.map((image, index) => {
    return {
      data: image,
      name: index + '.' + options.type
    };
  });
}

function storeScreenshots(url, imagesAndName, storageManager, options) {
  return Promise.map(imagesAndName, screenshot => {
    if (options.type === 'png') {
      sharp(screenshot.data)
        .resize(options.maxSize, options.maxSize)
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
      sharp(screenshot.data)
        .jpeg({ quality: options.jpg.quality })
        .resize(options.maxSize, options.maxSize)
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
  },
  processMessage(message, queue) {
    const make = this.make;
    switch (message.type) {
      case 'sitespeedio.setup': {
        queue.postMessage(make('browsertime.config', { screenshot: true }));
        break;
      }
      case 'browsertime.screenshot':
        return storeScreenshots(
          message.url,
          getImagesAndName(message.data, this.options),
          this.storageManager,
          this.options
        );
    }
  }
};
