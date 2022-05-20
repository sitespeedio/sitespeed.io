'use strict';

const path = require('path');
const osName = require('os-name');
const getos = require('getos');
const { promisify } = require('util');
const getOS = promisify(getos);
const os = require('os');
const get = require('lodash.get');
const graphiteUtil = require('../../support/tsdbUtil');
const helpers = require('../../support/helpers');

module.exports = {
  open(context, options) {
    this.storageManager = context.storageManager;
    this.alias = {};
    this.options = options;
    this.context = context;
  },
  async processMessage(message) {
    switch (message.type) {
      // Collect alias so we can use it
      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }

      case 'browsertime.browser': {
        this.browserData = message.data;
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
          const browserData = this.browserData;
          const baseDir = this.storageManager.getBaseDir();
          // Hack to get out of the date dir
          const newPath = path.resolve(baseDir, '..');

          // This is a hack to get the same name as in Grafana, meaning we can
          // generate the path to the URL there
          const name =
            (options.copyLatestFilesToBaseGraphiteNamespace
              ? `${options.graphite.namespace}.`
              : '') +
            graphiteUtil.getURLAndGroup(
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
              } else {
                // This is a user generated screenshot, we do not copy that
              }
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

          const timestamp = this.context.timestamp.format(
            'YYYY-MM-DD HH:mm:ss Z'
          );
          // Also store a JSON with data that we can use later
          const json = {
            url: message.url,
            alias: this.alias[message.url],
            timestamp,
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

          json.browser = {};
          json.browser.name = helpers.cap(
            get(browserData, 'browser.name', 'unknown')
          );
          json.browser.version = get(browserData, 'browser.version', 'unknown');

          json.friendlyHTML = `<b><a href="${message.url}">${
            json.alias ? json.alias : message.url
          }</a></b> ${helpers.plural(
            options.browsertime.iterations,
            'iteration'
          )} at <i>${json.timestamp}</i> using ${json.browser.name} ${
            json.browser.version
          }`;

          if (options.mobile) {
            json.friendlyHTML += ` (emulating mobile)`;
          }

          if (options.multi) {
            json.friendlyHTML += ` as a multi page test`;
          }

          if (options.replay) {
            json.friendlyHTML += ' using a replay proxy';
          }

          if (!options.mobile && !options.ios && !browserData.android) {
            json.friendlyHTML += ' with viewport ' + options.viewPort;
          }

          if (browserData.android) {
            json.friendlyHTML += ` on ${browserData.android.model} Android version ${browserData.android.androidVersion} [${browserData.android.id}].`;
          } else if (message.data.ios) {
            json.friendlyHTML += ` ${message.data.ios.deviceName} [${message.data.ios.deviceUDID}].`;
          } else {
            // We are testing on desktop
            let osInfo = osName();
            if (os.platform() === 'linux') {
              const linux = await getOS();
              osInfo = `${linux.dist} ${linux.release}`;
            }
            json.friendlyHTML += options.browsertime.docker
              ? ' using Docker ' + osInfo
              : ' on ' + osInfo;
          }

          // Hack to add a result URL
          if (this.context.resultUrls.hasBaseUrl()) {
            let resultURL =
              this.context.resultUrls.absoluteSummaryPageUrl(
                message.url,
                this.alias[message.url]
              ) + 'index.html';

            json.friendlyHTML +=
              ' [<b><a href="' + resultURL + '">result</a></b>].';
            json.result = resultURL;
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
