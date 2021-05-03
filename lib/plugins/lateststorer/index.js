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
            let imagePath = '';
            // We can have multiple screenshots (taken by the user) and
            // only use the standard one
            for (let screenshot of message.data.screenshots) {
              if (
                /afterPageCompleteCheck|layoutShift|largestContentfulPaint/.test(
                  screenshot
                )
              ) {
                const type = screenshot.substring(
                  screenshot.lastIndexOf('/') + 1,
                  screenshot.lastIndexOf('.')
                );

                imagePath = screenshot;
                const imageFullPath = path.join(baseDir, imagePath);
                await this.storageManager.copyFileToDir(
                  imageFullPath,
                  newPath +
                    '/' +
                    name +
                    (type !== 'afterPageCompleteCheck' ? `.${type}` : '') +
                    '.' +
                    options.browser +
                    '.' +
                    connectivity +
                    '.' +
                    this.screenshotType
                );
              } else console.log(screenshot);
            }
          }
          if (options.browsertime && options.browsertime.video) {
            const videoFullPath = path.join(baseDir, message.data.video);

            await this.storageManager.copyFileToDir(
              videoFullPath,
              newPath +
                '/' +
                name +
                '.' +
                options.browser +
                '.' +
                connectivity +
                '.mp4'
            );
          }

          // Also store a JSON with data that we can use later
          const json = {
            url: message.url,
            alias: this.alias[message.url],
            timestamp: message.data.timestamp,
            iterations: options.browsertime.iterations,
            name: options.name
          };

          if (message.data.ios) {
            json.ios = message.data.ios;
          }

          if (message.data.title) {
            json.title = message.data.title;
          }

          if (message.data.description) {
            json.description = message.data.description;
          }

          if (message.data.android) {
            json.android = {};
            json.android.model = message.data.android.model;
            json.android.androidVersion = message.data.android.androidVersion;
          }

          const data = JSON.stringify(json, null, 0);
          return this.storageManager.writeDataToDir(
            data,
            name + '.' + options.browser + '.' + connectivity + '.json',
            newPath
          );
        }
      }
    }
  }
};
