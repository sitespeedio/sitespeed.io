'use strict';

const path = require('path');
const graphiteUtil = require('../../support/tsdbUtil');

module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.alias = {};
    this.options = options;
  },
  async processMessage(message) {
    switch (message.type) {
      // Collect alias so we can use it
      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }

      case 'browsertime.config': {
        if (message.data.screenshot) {
          this.useScreenshots = message.data.screenshot;
          this.screenshotType = message.data.screenshotType;
        }
        break;
      }

      case 'browsertime.run': {
        // Only use the first one for now
        if (message.iteration === 1 && this.options.copyLatestFilesToBase) {
          const options = this.options;
          const baseDir = this.storageManager.getBaseDir();
          // Hack to get out of the date dir
          const newPath = path.resolve(baseDir, '..');

          // This is a hack to get the same name as in Grafana, meaning we can
          // generate the path to the URL there
          const name = graphiteUtil.getURLAndGroup(
            options,
            message.group,
            message.url,
            this.options.graphite.includeQueryParams,
            this.alias
          );
          const connectivity = graphiteUtil.getConnectivity(options);

          if (this.useScreenshots) {
            const imageFullPath = path.join(baseDir, message.data.screenshot);
            await this.storageManager.copyFileToDir(
              imageFullPath,
              newPath +
                '/' +
                name +
                '.' +
                this.options.browser +
                '.' +
                connectivity +
                '.' +
                this.screenshotType
            );
          }
          if (this.options.browsertime && this.options.browsertime.video) {
            const videoFullPath = path.join(baseDir, message.data.video);

            await this.storageManager.copyFileToDir(
              videoFullPath,
              newPath +
                '/' +
                name +
                '.' +
                this.options.browser +
                '.' +
                connectivity +
                '.mp4'
            );
          }

          // Also store a JSON with data that we can use later
          const json = {
            url: message.url,
            alias: this.alias[message.url],
            timestamp: message.data.timestamp
          };
          const data = JSON.stringify(json, null, 0);
          return this.storageManager.writeDataToDir(
            data,
            name + '.' + this.options.browser + '.' + connectivity + '.json',
            newPath
          );
        }
      }
    }
  }
};
