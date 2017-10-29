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
    this.make = context.messageMaker('screenshot').make;
    this.options = options;
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
          getImagesAndName(message.data),
          this.storageManager
        );
    }
  }
};
