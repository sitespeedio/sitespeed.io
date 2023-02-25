import { resolve, join } from 'node:path';
import { platform } from 'node:os';
import { promisify } from 'node:util';

import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import osName from 'os-name';
import getos from 'getos';
import get from 'lodash.get';

import { getURLAndGroup, getConnectivity } from '../../support/tsdbUtil.js';
import { cap, plural } from '../../support/helpers/index.js';

const getOS = promisify(getos);
export default class LatestStorerPlugin extends SitespeedioPlugin {
  constructor(options, context, queue) {
    super({ name: 'lateststorer', options, context, queue });
  }

  open(context, options) {
    this.storageManager = context.storageManager;
    this.alias = {};
    this.options = options;
    this.context = context;
  }
  async processMessage(message) {
    switch (message.type) {
      // Collect alias so we can use it
      case 'browsertime.alias': {
        this.alias[message.url] = message.data;
        break;
      }

      case 'browsertime.browser': {
        if (!this.browserData) {
          this.browserData = message.data;
        }
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
          const newPath = resolve(baseDir, '..');

          // This is a hack to get the same name as in Grafana, meaning we can
          // generate the path to the URL there
          const name =
            (options.copyLatestFilesToBaseGraphiteNamespace
              ? `${options.graphite.namespace}.`
              : '') +
            getURLAndGroup(
              options,
              message.group,
              message.url,
              this.options.graphite.includeQueryParams,
              this.alias
            );
          const connectivity = getConnectivity(options);

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
                const type = screenshot.slice(
                  screenshot.lastIndexOf('/') + 1,
                  screenshot.lastIndexOf('.')
                );

                imagePath = screenshot;
                const imageFullPath = join(baseDir, imagePath);
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
                // do nada
              }
            }
          }
          if (options.browsertime && options.browsertime.video) {
            const videoFullPath = join(baseDir, message.data.video);

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
            json.android.id = message.data.android.id;
          }

          json.browser = {};
          json.browser.name = cap(get(browserData, 'browser.name', 'unknown'));
          json.browser.version = get(browserData, 'browser.version', 'unknown');

          json.friendlyHTML = `<b><a href="${message.url}">${
            json.alias ?? message.url
          }</a></b> ${plural(
            options.browsertime.iterations,
            'iteration'
          )} at <i>${json.timestamp}</i> using ${json.browser.name} ${
            json.browser.version
          }`;

          if (options.browsertime && options.browsertime.preURL) {
            json.preURL = options.browsertime.preURL;
            json.friendlyHTML += ` first visiting <a href="${options.browsertime.preURL}">${options.browsertime.preURL}</a>`;
          }

          if (options.mobile) {
            json.friendlyHTML += ` (emulating mobile)`;
          }

          if (options.multi) {
            json.friendlyHTML += ` as a multi page test`;
          }

          if (options.replay) {
            json.friendlyHTML += ' using a replay proxy';
          }

          if (!options.mobile && !options.ios && !options.android) {
            json.friendlyHTML += ' with viewport ' + options.viewPort;
          }

          if (json.android) {
            json.friendlyHTML += ` on ${json.android.model} Android version ${json.android.androidVersion} [${json.android.id}].`;
          } else if (json.ios) {
            json.friendlyHTML += ` ${json.ios.deviceName} [${json.ios.deviceUDID}].`;
          } else {
            // We are testing on desktop
            let osInfo = osName();
            if (platform() === 'linux') {
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

          const data = JSON.stringify(json, undefined, 0);
          return this.storageManager.writeDataToDir(
            data,
            name + '.' + options.browser + '.' + connectivity + '.json',
            newPath
          );
        }
      }
    }
  }
}
