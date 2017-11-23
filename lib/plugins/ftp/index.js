'use strict';

const fs = require('fs-extra');
const log = require('intel').getLogger('sitespeedio.plugin.ftp');
const merge = require('lodash.merge');
const path = require('path');
const PromiseFtp = require('promise-ftp');
const throwIfMissing = require('../../support/util').throwIfMissing;

const defaultConfig = {
  host: 'localhost',
  port: 21,
  user: 'user',
  password: 'password'
};

module.exports = {
  open(context, options) {
    this.ftpOptions = options.ftp;
    this.make = context.messageMaker('ftp').make;

    throwIfMissing(this.ftpOptions, ['host'], 'ftp');
    throwIfMissing(this.ftpOptions, ['user', 'password'], 'ftp');
    this.storageManager = context.storageManager;
  },

  processMessage(message, queue) {
    const make = this.make;
    if (message.type === 'html.finished') {
      const ftpConfig = merge({}, defaultConfig, this.ftpOptions);
      const baseDir = this.storageManager.getBaseDir();
      const client = new PromiseFtp();

      return new Promise(resolve => {
        log.info(
          `FTP uploading output (${baseDir}) to FTP ${ftpConfig.user}@${
            ftpConfig.host
          }, this can take a while ...`
        );
        var dirlist = [];
        var filelist = [];

        function walkSync(dir) {
          var files = fs.readdirSync(dir);
          files.forEach(function(file) {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
              dirlist.push(path.join(dir, file));
              walkSync(path.join(dir, file), []);
            } else {
              filelist.push(path.join(dir, file));
            }
          });
        }

        walkSync(baseDir);
        client
          .connect(ftpConfig)
          .then(function() {
            dirlist.forEach(function(element) {
              log.debug(`FTPying directory(${element})`);
              return client.mkdir(element, true);
            });
            filelist.forEach(function(element) {
              log.debug(`FTPying file(${element})`);
              return client.put(element, element);
            });
          })
          .then(function() {
            if (ftpConfig.removeLocalResult) {
              fs.remove(baseDir).then(() => {
                log.debug(`Removed local files and directory ${baseDir}`);
              });
            }
            queue.postMessage(make('ftp.finished'));
            return client.end();
          })
          .then(function() {
            resolve();
          });
      });
    }
  }
};
