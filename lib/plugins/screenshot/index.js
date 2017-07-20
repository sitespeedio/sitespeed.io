'use strict';

const Promise = require('bluebird');

function getImagesAndName(images) {
  return images.map((image, index) => {
    return {
      data: image,
      name: index + '.png'
    };
  });
}

function storeScreenshots(url, imagesAndName, storageManager) {
  return Promise.map(imagesAndName, screenshot =>
    storageManager.writeDataForUrl(
      screenshot.data,
      screenshot.name,
      url,
      'screenshots'
    )
  );
}

module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.options = options;
  },
  processMessage(message) {
    switch (message.type) {
      case 'browsertime.screenshot':
        return storeScreenshots(
          message.url,
          getImagesAndName(message.data),
          this.storageManager
        );
    }
  }
};
